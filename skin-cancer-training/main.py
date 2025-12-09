import os, shutil
import random
import subprocess
import zipfile
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from collections import Counter
from PIL import Image

from sklearn.utils import class_weight
from sklearn.metrics import classification_report, roc_auc_score, roc_curve, auc, precision_recall_curve, confusion_matrix, ConfusionMatrixDisplay, multilabel_confusion_matrix
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB4
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, LearningRateScheduler
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical
from tensorflow.keras import mixed_precision

mixed_precision.set_global_policy("mixed_float16")

metadata_path = "./HAM10000_metadata.csv"
image_folder = "./Skin Cancer/Skin Cancer"
destination_root = "Categories"
plots_dir = "plots"
os.makedirs(destination_root, exist_ok=True)
os.makedirs(plots_dir, exist_ok=True)

# Download dataset from Kaggle if not present
def download_dataset_from_kaggle():
    """Download HAM10000 dataset from Kaggle if it doesn't exist locally."""
    # Check if dataset already exists
    if os.path.exists(metadata_path) and os.path.exists(image_folder):
        print("Dataset already exists. Skipping download.")
        return
    
    print("Dataset not found. Downloading from Kaggle...")
    
    # Check if kaggle is installed
    try:
        subprocess.run(["kaggle", "--version"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except (subprocess.CalledProcessError, FileNotFoundError):
        raise RuntimeError(
            "Kaggle CLI not found. Please install it with: pip install kaggle\n"
            "Also ensure you have set up your Kaggle API credentials at ~/.kaggle/kaggle.json"
        )
    
    # Download the dataset (HAM10000 is available at this path)
    dataset_name = "kmader/skin-cancer-mnist-ham10000"
    print(f"Downloading dataset: {dataset_name}")
    
    try:
        subprocess.run(
            ["kaggle", "datasets", "download", "-d", dataset_name],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Find the downloaded zip file
        zip_file = None
        for file in os.listdir("."):
            if "ham10000" in file.lower() and file.endswith(".zip"):
                zip_file = file
                break
        
        if not zip_file:
            raise FileNotFoundError("Downloaded zip file not found")
        
        print(f"Extracting {zip_file}...")
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(".")
        
        # Clean up zip file
        os.remove(zip_file)
        
        # The dataset structure may vary, so we need to handle it
        # Typically, the images are in a subfolder and metadata is in the root
        # Check if we need to reorganize the folder structure
        if not os.path.exists(image_folder):
            # Try to find where the images were extracted
            image_found = False
            for root, dirs, files in os.walk("."):
                # Check for common HAM10000 folder structures
                if "HAM10000_images_part_1" in dirs or "HAM10000_images_part_2" in dirs:
                    # Create the expected folder structure
                    os.makedirs(image_folder, exist_ok=True)
                    # Move images from part folders
                    for part in ["HAM10000_images_part_1", "HAM10000_images_part_2"]:
                        part_path = os.path.join(root, part)
                        if os.path.exists(part_path):
                            for img_file in os.listdir(part_path):
                                if img_file.lower().endswith(('.jpg', '.png', '.jpeg')):
                                    shutil.move(
                                        os.path.join(part_path, img_file),
                                        os.path.join(image_folder, img_file)
                                    )
                            # Remove empty part folder
                            try:
                                os.rmdir(part_path)
                            except OSError:
                                pass
                    image_found = True
                    break
                # Also check for single images folder
                elif "HAM10000_images" in dirs:
                    images_dir = os.path.join(root, "HAM10000_images")
                    if os.path.exists(images_dir):
                        os.makedirs(image_folder, exist_ok=True)
                        for img_file in os.listdir(images_dir):
                            if img_file.lower().endswith(('.jpg', '.png', '.jpeg')):
                                shutil.move(
                                    os.path.join(images_dir, img_file),
                                    os.path.join(image_folder, img_file)
                                )
                        try:
                            os.rmdir(images_dir)
                        except OSError:
                            pass
                        image_found = True
                        break
            
            if not image_found:
                print("Warning: Could not automatically organize images. Please check the extracted folder structure.")
        
        print("Dataset downloaded and extracted successfully!")
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        raise RuntimeError(f"Failed to download dataset from Kaggle: {error_msg}")

# Download dataset if needed
download_dataset_from_kaggle()

metadata = pd.read_csv(metadata_path)
for filename in os.listdir(image_folder):
    if filename.lower().endswith(('.jpg', '.png', '.jpeg')):
        image_name = os.path.splitext(filename)[0]
        row = metadata[metadata["image_id"] == image_name]
        if not row.empty:
            label = row.iloc[0]['dx']
            dest_folder = os.path.join(destination_root, label)
            os.makedirs(dest_folder, exist_ok=True)
            shutil.copy(os.path.join(image_folder, filename), os.path.join(dest_folder, filename))

# DATA BALANCING
def balance_dataset(destination_root, target_samples_per_class=None, max_samples_per_class=None):
    """
    Balance dataset by oversampling minority classes and optionally undersampling majority classes.
    
    Args:
        destination_root: Root directory containing class folders
        target_samples_per_class: Target number of samples per class (None = use median)
        max_samples_per_class: Maximum samples per class (None = no limit)
    """
    # Count samples per class
    class_counts = {}
    for class_folder in os.listdir(destination_root):
        class_path = os.path.join(destination_root, class_folder)
        if os.path.isdir(class_path):
            count = len([f for f in os.listdir(class_path) 
                        if f.lower().endswith(('.jpg', '.png', '.jpeg'))])
            class_counts[class_folder] = count
    
    print("\nOriginal class distribution:")
    for cls, count in sorted(class_counts.items(), key=lambda x: x[1]):
        print(f"  {cls}: {count} samples")
    
    # Determine target samples (use median if not specified)
    if target_samples_per_class is None:
        counts = list(class_counts.values())
        target_samples_per_class = int(np.median(counts))
        print(f"\nTarget samples per class (median): {target_samples_per_class}")
    
    # Augmentation function for oversampling
    def augment_image(image_path, output_path, num_augmentations=1):
        """Create augmented versions of an image"""
        img = Image.open(image_path)
        augmentations = [
            lambda x: x.rotate(random.randint(-30, 30)),
            lambda x: x.transpose(Image.FLIP_LEFT_RIGHT),
            lambda x: x.transpose(Image.FLIP_TOP_BOTTOM),
            lambda x: x.rotate(random.randint(-15, 15)).transpose(Image.FLIP_LEFT_RIGHT),
        ]
        
        for i in range(num_augmentations):
            aug_img = random.choice(augmentations)(img)
            base_name = os.path.splitext(output_path)[0]
            ext = os.path.splitext(output_path)[1]
            aug_img.save(f"{base_name}_aug{i}{ext}")
    
    # Balance each class
    for class_folder, current_count in class_counts.items():
        class_path = os.path.join(destination_root, class_folder)
        image_files = [f for f in os.listdir(class_path) 
                      if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
        
        if current_count < target_samples_per_class:
            # OVERSAMPLE: Create augmented copies
            needed = target_samples_per_class - current_count
            print(f"\nOversampling {class_folder}: {current_count} -> {target_samples_per_class} (+{needed})")
            
            # Calculate how many augmentations per original image
            augs_per_image = (needed // current_count) + 1
            
            for img_file in image_files:
                if needed <= 0:
                    break
                img_path = os.path.join(class_path, img_file)
                base_name = os.path.splitext(img_file)[0]
                ext = os.path.splitext(img_file)[1]
                
                for aug_num in range(min(augs_per_image, needed)):
                    output_name = f"{base_name}_aug{aug_num}{ext}"
                    output_path = os.path.join(class_path, output_name)
                    augment_image(img_path, output_path)
                    needed -= 1
        
        elif max_samples_per_class and current_count > max_samples_per_class:
            # UNDERSAMPLE: Randomly remove excess samples
            excess = current_count - max_samples_per_class
            print(f"\nUndersampling {class_folder}: {current_count} -> {max_samples_per_class} (-{excess})")
            
            to_remove = random.sample(image_files, excess)
            for img_file in to_remove:
                os.remove(os.path.join(class_path, img_file))
    
    # Print final distribution
    print("\nFinal class distribution:")
    for class_folder in os.listdir(destination_root):
        class_path = os.path.join(destination_root, class_folder)
        if os.path.isdir(class_path):
            count = len([f for f in os.listdir(class_path) 
                        if f.lower().endswith(('.jpg', '.png', '.jpeg'))])
            print(f"  {class_folder}: {count} samples")

# Balance dataset (using median as target)
balance_dataset(destination_root, target_samples_per_class=None)

img_size = 380
batch_size = 32
input_shape = (img_size, img_size, 3)
epochs = 15

datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=30,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.1,
    zoom_range=0.2,
    brightness_range=[0.9, 1.1],
    horizontal_flip=True,
    fill_mode='nearest',
    validation_split=0.2
)
train_gen = datagen.flow_from_directory(
    destination_root,
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=True,
    subset='training'
)

val_gen = datagen.flow_from_directory(
    destination_root,
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False,
    subset='validation'
)

# Print class distribution after balancing
print("\nTraining set class distribution:")
class_counts = Counter(train_gen.classes)
for class_name, idx in train_gen.class_indices.items():
    count = class_counts[idx]
    print(f"  {class_name}: {count} samples")

# CLASS WEIGHTS 
weights = class_weight.compute_class_weight(
    class_weight='balanced',
    classes=np.unique(train_gen.classes),
    y=train_gen.classes
)
class_weights = dict(enumerate(weights))

# MODEL
base_model = EfficientNetB4(include_top=False, weights='imagenet', input_shape=input_shape)
x = GlobalAveragePooling2D()(base_model.output)
x = Dropout(0.3)(x)
output = Dense(train_gen.num_classes, activation='softmax')(x)
model = Model(inputs=base_model.input, outputs=output)

for layer in base_model.layers[-40:]:
    layer.trainable = True

# COMPILE
model.compile(
    optimizer=Adam(learning_rate=1e-4),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy']
)

# COSINE LR SCHEDULER 
def cosine_decay(epoch, initial_lr=1e-4, total_epochs=epochs, min_lr=1e-6):
    cosine = initial_lr * 0.5 * (1 + np.cos(np.pi * epoch / total_epochs))
    return max(cosine, min_lr)

callbacks = [
    EarlyStopping(monitor='val_accuracy', patience=8, restore_best_weights=True),
    ModelCheckpoint("best_model.h5", monitor="val_accuracy", save_best_only=True),
    LearningRateScheduler(lambda epoch: cosine_decay(epoch))
]

# TRAIN 
history = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=epochs,
    class_weight=class_weights,
    callbacks=callbacks
)

# EVALUATE 
model.load_weights("best_model.h5")
loss, acc = model.evaluate(val_gen)
print(f"\nFinal Validation Accuracy: {acc * 100:.2f}%")

# TTA
def tta_predict(model, generator, steps=5):
    preds = []
    for _ in range(steps):
        generator.reset()
        preds.append(model.predict(generator, verbose=0))
    return np.mean(preds, axis=0)

tta_preds = tta_predict(model, val_gen)
tta_labels = val_gen.classes
tta_pred_labels = np.argmax(tta_preds, axis=1)
tta_acc = np.mean(tta_pred_labels == tta_labels)
print(f"\nTTA Accuracy: {tta_acc * 100:.2f}%")

# METRICS (MACRO) 
y_true = tta_labels
y_pred = tta_pred_labels
y_pred_proba = tta_preds
y_true_categorical = to_categorical(y_true, num_classes=train_gen.num_classes)

target_names = list(train_gen.class_indices.keys())
report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
precision = report['macro avg']['precision'] * 100
recall = report['macro avg']['recall'] * 100
f1 = report['macro avg']['f1-score'] * 100
roc_auc = roc_auc_score(y_true_categorical, y_pred_proba, average='macro') * 100

print(f"\nMacro Precision: {precision:.2f}%")
print(f"Macro Recall: {recall:.2f}%")
print(f"Macro F1-Score: {f1:.2f}%")
print(f"ROC-AUC Score (macro): {roc_auc:.2f}%")

# CLASS-WISE REPORT
full_report = classification_report(
    y_true, y_pred, target_names=target_names, digits=2, zero_division=0
)
print("\nClass-wise Classification Report:\n")
print(full_report)

# PLOTS 
# Accuracy
plt.figure(figsize=(8, 5))
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Training vs Validation Accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig(os.path.join(plots_dir, 'accuracy_curve.png'), dpi=300, bbox_inches='tight')
plt.show()
plt.close()

# Loss
plt.figure(figsize=(8, 5))
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Training vs Validation Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig(os.path.join(plots_dir, 'loss_curve.png'), dpi=300, bbox_inches='tight')
plt.show()
plt.close()

# ROC Curve
fpr, tpr, roc_auc = {}, {}, {}
for i in range(len(target_names)):
    fpr[i], tpr[i], _ = roc_curve(y_true_categorical[:, i], y_pred_proba[:, i])
    roc_auc[i] = auc(fpr[i], tpr[i])

plt.figure(figsize=(8, 6))
for i in range(len(target_names)):
    plt.plot(fpr[i], tpr[i], label=f'{target_names[i]} (AUC = {roc_auc[i]:.2f})')
plt.plot([0, 1], [0, 1], 'k--')
plt.title('ROC Curve (TTA)')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.legend(loc='lower right')
plt.grid(True)
plt.tight_layout()
plt.savefig(os.path.join(plots_dir, 'roc_curve.png'), dpi=300, bbox_inches='tight')
plt.show()
plt.close()

# Precision-Recall Curve
plt.figure(figsize=(8, 6))
for i in range(len(target_names)):
    precision_i, recall_i, _ = precision_recall_curve(y_true_categorical[:, i], y_pred_proba[:, i])
    plt.plot(recall_i, precision_i, label=f'{target_names[i]}')
plt.title('Precision-Recall Curve (TTA)')
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig(os.path.join(plots_dir, 'precision_recall_curve.png'), dpi=300, bbox_inches='tight')
plt.show()
plt.close()

# Confusion Matrix
cm = confusion_matrix(y_true, y_pred)
fig, ax = plt.subplots(figsize=(8, 6))
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=target_names)
disp.plot(ax=ax, cmap='Blues', values_format='d')
plt.title("Confusion Matrix")
plt.grid(False)
plt.tight_layout()
plt.savefig(os.path.join(plots_dir, 'confusion_matrix.png'), dpi=300, bbox_inches='tight')
plt.show()
plt.close()

# Confusion Matrix Heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='YlGnBu', xticklabels=target_names, yticklabels=target_names)
plt.title("Confusion Matrix Heatmap")
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.tight_layout()
plt.savefig(os.path.join(plots_dir, 'confusion_matrix_heatmap.png'), dpi=300, bbox_inches='tight')
plt.show()
plt.close()

# CLASS-WISE ROC-AUC & ACCURACY
print("\nClass-wise ROC-AUC and Accuracy:\n")
class_roc_aucs = []
class_accuracies = []

for i, class_name in enumerate(target_names):
    auc_score = roc_auc[i] * 100
    class_roc_aucs.append(auc_score)

    true_indices = np.where(y_true == i)[0]
    correct_predictions = np.sum(y_pred[true_indices] == y_true[true_indices])
    class_acc = (correct_predictions / len(true_indices)) * 100
    class_accuracies.append(class_acc)

    print(f"🔹 {class_name:<15} | Accuracy: {class_acc:.2f}% | ROC-AUC: {auc_score:.2f}%")

# ROC-AUC Bar Chart
plt.figure(figsize=(8, 6))
sns.barplot(x=class_roc_aucs, y=target_names, palette='coolwarm')
plt.xlabel("ROC-AUC (%)")
plt.title("Class-wise ROC-AUC Scores")
plt.xlim(0, 100)
plt.grid(True, axis='x')
plt.tight_layout()
plt.savefig(os.path.join(plots_dir, 'roc_auc_bar_chart.png'), dpi=300, bbox_inches='tight')
plt.show()
plt.close()

# CLASS-WISE CONFUSION MATRIX HEATMAPS 
print("\nClass-wise Confusion Matrix Heatmaps:\n")
mcm = multilabel_confusion_matrix(y_true, y_pred, labels=np.arange(len(target_names)))

for i, class_name in enumerate(target_names):
    cm_i = mcm[i]
    plt.figure(figsize=(4, 3))
    sns.heatmap(cm_i, annot=True, fmt='d', cmap='Oranges', cbar=False,
                xticklabels=['Pred: No', 'Pred: Yes'],
                yticklabels=['Actual: No', 'Actual: Yes'])
    plt.title(f"Confusion Matrix for Class: {class_name}")
    plt.tight_layout()
    # Sanitize filename by replacing any invalid characters
    safe_class_name = class_name.replace('/', '_').replace('\\', '_')
    plt.savefig(os.path.join(plots_dir, f'confusion_matrix_{safe_class_name}.png'), dpi=300, bbox_inches='tight')
    plt.show()
    plt.close()

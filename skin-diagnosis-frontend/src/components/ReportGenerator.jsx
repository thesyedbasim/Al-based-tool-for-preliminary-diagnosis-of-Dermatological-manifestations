import React from 'react';
import { Download, FileText, Calendar, User } from 'lucide-react';

const ReportGenerator = ({ diagnosis, userInfo }) => {
  const generatePDFReport = () => {
    // This would generate a PDF in a real application
    const reportContent = `
      SKIN DIAGNOSIS REPORT
      =====================
      
      Patient: ${userInfo.name}
      Email: ${userInfo.email}
      Age: ${userInfo.age}
      Gender: ${userInfo.gender}
      
      Diagnosis Date: ${new Date(diagnosis.timestamp).toLocaleDateString()}
      
      AI ANALYSIS RESULTS:
      ${diagnosis.diagnosis.conditions.map(cond => 
        `- ${cond.name} (${cond.probability} probability): ${cond.description}`
      ).join('\n')}
      
      RECOMMENDATIONS:
      ${diagnosis.diagnosis.recommendations.map(rec => `- ${rec}`).join('\n')}
      
      SEVERITY: ${diagnosis.diagnosis.severity}
      CONFIDENCE: ${diagnosis.diagnosis.confidence}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skin-diagnosis-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="h-5 w-5 mr-2 text-green-600" />
        Diagnosis Report
      </h3>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="font-medium">Patient Name:</span>
          <span>{userInfo.name}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="font-medium">Analysis Date:</span>
          <span>{new Date(diagnosis.timestamp).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="font-medium">AI Mode:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            diagnosis.aiMode === 'real' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {diagnosis.aiMode === 'real' ? 'Real AI' : 'Mock AI'}
          </span>
        </div>
      </div>

      <button
        onClick={generatePDFReport}
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Full Report
      </button>
    </div>
  );
};

export default ReportGenerator;
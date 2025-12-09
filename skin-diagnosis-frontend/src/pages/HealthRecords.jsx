import React from 'react';
import { FileText, Calendar, Download, Eye } from 'lucide-react';

const HealthRecords = () => {
  const records = [
    {
      id: 1,
      date: '2024-01-15',
      condition: 'Suspected Melanoma',
      doctor: 'Dr. Sarah Johnson',
      status: 'Reviewed',
      image: true,
      report: true
    },
    {
      id: 2,
      date: '2023-12-10',
      condition: 'Eczema Analysis',
      doctor: 'Dr. Michael Chen',
      status: 'Completed',
      image: true,
      report: true
    },
    {
      id: 3,
      date: '2023-11-05',
      condition: 'Skin Rash Assessment',
      doctor: 'AI Diagnosis',
      status: 'Pending Review',
      image: true,
      report: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Health Records</h1>
        <p className="text-gray-600">Your diagnosis history and medical reports</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Diagnosis History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{record.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.condition}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.doctor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      record.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      {record.report && (
                        <button className="text-green-600 hover:text-green-900 flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-800">{records.length}</div>
          <div className="text-gray-600">Total Records</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Calendar className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-800">2</div>
          <div className="text-gray-600">Doctor Reviewed</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Download className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-800">2</div>
          <div className="text-gray-600">Reports Available</div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
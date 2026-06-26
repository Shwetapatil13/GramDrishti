import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const downloadFile = (url: string, filename: string) => {
  return axios.get(url, { responseType: 'blob' }).then((response) => {
    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });
    
    // Check if filename is in content-disposition
    const contentDisposition = response.headers['content-disposition'];
    let finalFilename = filename;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch.length === 2) {
        finalFilename = filenameMatch[1];
      }
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  });
};

export const downloadPDF = async (villageId: string, year: number, includeAI: boolean): Promise<void> => {
  const url = `${apiBaseUrl}/api/v1/reports/${villageId}/pdf?year=${year}&include_ai=${includeAI}`;
  await downloadFile(url, `GramDrishti_Report_${villageId}_${year}.pdf`);
};

export const downloadJSON = async (villageId: string, year: number): Promise<void> => {
  const url = `${apiBaseUrl}/api/v1/reports/${villageId}/json?year=${year}`;
  await downloadFile(url, `GramDrishti_Data_${villageId}_${year}.json`);
};

export const downloadCSV = async (villageId: string): Promise<void> => {
  const url = `${apiBaseUrl}/api/v1/reports/${villageId}/csv`;
  await downloadFile(url, `GramDrishti_History_${villageId}.csv`);
};
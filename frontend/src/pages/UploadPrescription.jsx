import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPrescription } from '../api';

const UploadPrescription = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : ''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('prescription', file);
      await uploadPrescription(fd);
      navigate('/prescriptions');
    } catch (err) { setError(err.response?.data?.message || 'Upload failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-practo-navy mb-1">Upload Prescription</h1>
      <p className="text-practo-gray text-sm mb-6">Upload a prescription photo or PDF to order medicines</p>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-practo-blue hover:bg-practo-blue-light/30 transition-all duration-300 cursor-pointer"
            onClick={() => document.getElementById('file-input').click()}>
            <input id="file-input" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-52 mx-auto rounded-xl shadow-sm" />
            ) : file ? (
              <div>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><span className="text-3xl">📄</span></div>
                <p className="text-practo-navy font-semibold">{file.name}</p>
                <p className="text-sm text-practo-gray">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-practo-blue-light rounded-2xl flex items-center justify-center mx-auto mb-3"><span className="text-3xl">📤</span></div>
                <p className="text-practo-navy font-semibold">Click to upload prescription</p>
                <p className="text-sm text-practo-gray mt-1">Supports JPEG, PNG, PDF (max 5MB)</p>
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting || !file} className="w-full py-3 bg-practo-blue hover:bg-practo-blue-dark text-white font-semibold rounded-xl transition-all shadow-button disabled:opacity-50 text-sm">
            {submitting ? 'Uploading...' : 'Upload Prescription'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPrescription;

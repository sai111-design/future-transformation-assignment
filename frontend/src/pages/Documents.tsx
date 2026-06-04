import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  listDocuments,
  uploadDocument,
  getDocument,
  type Document,
  type DocumentDetail,
} from "../api/documents";

export default function Documents() {
  const { role } = useAuth();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  useEffect(() => {
    listDocuments()
      .then(setDocs)
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".txt")) {
      setUploadError("Only .txt files are allowed.");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const doc = await uploadDocument(file, title || undefined);
      setDocs((prev) => [doc, ...prev]);
      setFile(null);
      setTitle("");
    } catch {
      setUploadError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRowClick(id: number) {
    if (detail?.id === id) {
      setDetail(null);
      return;
    }
    const d = await getDocument(id);
    setDetail(d);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Documents</h1>

      {role === "admin" && (
        <form
          onSubmit={handleUpload}
          className="bg-white shadow rounded-lg p-4 mb-6 flex items-end space-x-3"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File (.txt)
            </label>
            <input
              type="file"
              accept=".txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (optional)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Derived from filename if empty"
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !file}
            className="bg-indigo-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {uploadError && (
            <p className="text-sm text-red-600">{uploadError}</p>
          )}
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-500">No documents yet.</p>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id}>
              <div
                onClick={() => handleRowClick(doc.id)}
                className="bg-white shadow rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-indigo-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium">{doc.title}</h2>
                    <p className="text-sm text-gray-500">{doc.filename}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {detail?.id === doc.id && (
                <div className="bg-gray-100 rounded-b-lg p-4 mt-px border border-t-0 border-gray-200">
                  <pre className="text-sm whitespace-pre-wrap text-gray-700">
                    {detail.content_text}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

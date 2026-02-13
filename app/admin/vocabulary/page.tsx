export default function AdminVocabularyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vocabulary</h1>

      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <p className="text-gray-600">
          This is the Admin Vocabulary panel.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-xl p-4">
            <h2 className="font-semibold mb-2">Total Words</h2>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>

          <div className="border rounded-xl p-4">
            <h2 className="font-semibold mb-2">Categories</h2>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Pawa Pick</h1>
      <p className="text-gray-500 text-lg">The async matchmaker is booting up.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center h-32">
          <span className="font-semibold text-gray-400">Feed Block 1</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center h-32">
          <span className="font-semibold text-gray-400">Feed Block 2</span>
        </div>
      </div>
    </div>
  );
}

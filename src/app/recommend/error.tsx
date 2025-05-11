'use client';

export default function Error({ error, reset}: {error: Error; reset: () => void}) {
  return (
    <div className="p-8 text-center text-white">
      <p className="mb-4">通信エラーが発生しました</p>
      <button
        onClick={() => reset()}
        className="px-5 py-2 bg-red-600 rounded hover:bg-red-700 transition">
          再試行
      </button>
    </div>    
  );
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row">
          <div className="mb-4 flex items-center md:mb-0">
            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
              <span className="font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold">SULOG</span>
          </div>
          <div className="text-sm text-gray-400">
            © 2025 Template. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

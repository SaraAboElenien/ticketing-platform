/**
 * Footer — minimal site footer.
 */

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-neutral-400">
          &copy; {new Date().getFullYear()} TicketHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}


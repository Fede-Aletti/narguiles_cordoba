'use client'

export default function ErrorPage() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen bg-black text-white">
      <p className="text-2xl font-bold">Sorry, something went wrong</p>
      <p className="text-lg">Please try again later</p>
      <p className="text-lg">If the problem persists, please contact support</p>
      <p className="text-lg">Support email: support@hookah.com</p>
      <p className="text-lg">Support phone: 123-456-7890</p>
      <p className="text-lg">Support hours: 9:00 AM - 5:00 PM</p>
      <p className="text-lg">Support address: 123 Main St, Anytown, USA</p>
    </div>
  );
}
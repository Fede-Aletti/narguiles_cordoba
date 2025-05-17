import { login, signup } from "@/actions/login-action";

export default function LoginPage() {
  return (
    <form className="flex flex-col gap-4 items-center justify-center h-screen bg-black text-white">
      <div className="flex flex-col gap-4 min-w-96">
        <label htmlFor="email" className="text-white">
          Email:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="bg-white text-black px-4 py-2 rounded-md"
        />
        <label htmlFor="password" className="text-white">
          Password:
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="bg-white text-black px-4 py-2 rounded-md"
        />
        <button
          formAction={login}
          className="bg-white/75 text-black px-4 py-2 rounded-md hover:bg-white transition-all duration-300"
        >
          Log in
        </button>
        <button
          formAction={signup}
          className="bg-white/75 text-black px-4 py-2 rounded-md hover:bg-white transition-all duration-300"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}

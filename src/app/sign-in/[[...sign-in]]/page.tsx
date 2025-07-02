import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-0 m-0 flex flex-col items-center justify-center">
        <SignIn />
      </div>
    </div>
  );
}

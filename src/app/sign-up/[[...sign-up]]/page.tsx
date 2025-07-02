import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className=" flex flex-col items-center justify-center ">
        <SignUp />
      </div>
    </div>
  );
}

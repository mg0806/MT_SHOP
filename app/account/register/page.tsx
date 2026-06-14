import { getCurrentUser } from "@/actions/getCurrentUser";
import RegisterForm from "@/app/Register/RegisterForm";

const AccountRegisterPage = async () => {
  const currentUser = await getCurrentUser();
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-4xl font-black uppercase">Create Account</h1>
      <RegisterForm currentUser={currentUser} />
    </div>
  );
};

export default AccountRegisterPage;

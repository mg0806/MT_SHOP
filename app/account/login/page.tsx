import { getCurrentUser } from "@/actions/getCurrentUser";
import LoginForm from "@/app/Login/LoginForm";

const AccountLoginPage = async () => {
  const currentUser = await getCurrentUser();
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-4xl font-black uppercase">Account Login</h1>
      <LoginForm currentUser={currentUser} />
    </div>
  );
};

export default AccountLoginPage;

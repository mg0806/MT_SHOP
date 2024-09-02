"use client";

import { useCallback, useState } from "react";
import Avatar from "../universal/Avatar";
import { AiFillCaretDown } from "react-icons/ai";
import Link from "next/link";
import MenuItem from "./MenuItem";
import { signOut } from "next-auth/react";
import BackDrop from "./BackDrop";
import Loader from "@/components/universal/Loader"; // Import the Loader component
import { SafeUser } from "@/types";

interface UserMenuProps {
  currentUser: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false); // State to manage loading

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSignOut = async () => {
    setLoading(true); // Show loader when sign out starts
    await signOut({
      callbackUrl: "/Login", // Redirect to the login page after sign out
    });
    setLoading(false);
    setIsOpen(false);
    // Reset loading state after sign out
  };

  const handleClick = () => {
    setLoading(true); // Show loader when any menu item is clicked
    setTimeout(() => {
      setLoading(false); // Simulate a delay, remove if unnecessary
      setIsOpen(false);
    }, 1500); // Adjust the timeout duration as needed
  };

  return (
    <>
      <div className="relative z-30">
        <div
          onClick={toggleOpen}
          className="p-2 border-[1px] border-slate-400 flex flex-row items-center gap-1 rounded-full cursor-pointer hover:shadow-md transition text-slate-700"
        >
          <Avatar src={currentUser?.image} />
          <AiFillCaretDown />

          {isOpen && (
            <div className="absolute rounded-md shadow-md w-[170px] bg-white overflow-hidden right-0 top-12 text-sm flex flex-col cursor-pointer">
              {currentUser ? (
                <div>
                  <Link href="/orders">
                    <MenuItem
                      onClick={() => {
                        handleClick(); // Handle loader on click
                        toggleOpen();
                      }}
                    >
                      Your Orders
                    </MenuItem>
                  </Link>
                  {currentUser.role === "ADMIN" && (
                    <Link href="/admin">
                      <MenuItem
                        onClick={() => {
                          handleClick(); // Handle loader on click
                          toggleOpen();
                        }}
                      >
                        Admin Dashboard
                      </MenuItem>
                    </Link>
                  )}
                  <hr />
                  <MenuItem
                    onClick={() => {
                      toggleOpen();
                      handleSignOut(); // Handle sign out with loading state
                    }}
                  >
                    Log Out
                  </MenuItem>
                </div>
              ) : (
                <div>
                  <Link href="/Login">
                    <MenuItem
                      onClick={() => {
                        handleClick(); // Handle loader on click
                        toggleOpen();
                      }}
                    >
                      Login
                    </MenuItem>
                  </Link>
                  <Link href="/Register">
                    <MenuItem
                      onClick={() => {
                        handleClick(); // Handle loader on click
                        toggleOpen();
                      }}
                    >
                      Register
                    </MenuItem>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {isOpen ? <BackDrop onClick={toggleOpen} /> : null}
      {loading && <Loader />}{" "}
      {/* Show loader while any action is in progress */}
    </>
  );
};

export default UserMenu;

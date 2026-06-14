import React from "react";

interface BackDropProps {
  onClick: () => void;
}
const BackDrop: React.FC<BackDropProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="fixed inset-0 w-screen h-screen bg-[#171412]/20 backdrop-blur-sm z-30 cursor-pointer"
    />
  );
};

export default BackDrop;

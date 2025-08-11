const Card = ({ children, label }) => {
  return (
    <div
      className={`w-full max-w-[400px] min-w-[350px] bg-white rounded-lg shadow-2xl p-6 flex flex-col `}
    >
      <h2 className="text-xl font-semibold mb-4">{label}</h2>
      {children}
    </div>
  );
};

export default Card;


function Dashboard({ setActivePage }) {
  const services = [
    {
      icon: "🛍️",
      title: "Student Marketplace",
      description:
        "Explore books, electronics, stationery and other products listed by fellow university students.",
      page: "Buy Products",
      label: "BUY & SELL",
    },
    {
      icon: "🔍",
      title: "Lost & Found",
      description:
        "Report lost belongings, discover found items and reconnect students with their valuables.",
      page: "Lost & Found",
      label: "FIND YOUR BELONGINGS",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* University Heading */}
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-[#A47B29]">
          VIKRANT UNIVERSITY
        </p>

        <h1 className="mt-2 text-2xl font-bold text-[#10294D] md:text-3xl">
          University Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500 md:text-base">
          Your university's digital student service platform.
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#10294D] to-[#285582] px-6 py-10 text-white shadow-md md:px-12 md:py-14">

        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#E6C77D]">
            CAMPUSCONNECT STUDENT PORTAL
          </p>

          <h2 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
            Welcome to CampusConnect
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 md:text-base">
            A digital platform designed to help Vikrant University
            students exchange resources and reconnect with lost belongings.
          </p>

          <button
            onClick={() => setActivePage("Buy Products")}
            className="mt-7 rounded-md bg-[#D9B76A] px-6 py-3 text-sm font-bold text-[#10294D] transition hover:bg-[#E8CA83]"
          >
            Explore Marketplace →
          </button>
        </div>

        <div className="absolute -right-16 -bottom-24 hidden h-72 w-72 rounded-full border-[35px] border-white/10 md:block" />
        <div className="absolute right-24 top-10 hidden h-20 w-20 rounded-full bg-white/5 md:block" />
      </section>

      {/* Services */}
      <section>
        <div className="mb-6 border-b border-gray-200 pb-4">
          <p className="text-xs font-bold tracking-[0.2em] text-[#A47B29]">
            AVAILABLE FACILITIES
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#10294D] md:text-2xl">
            Student Services
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Access the services currently available on CampusConnect.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D9B76A] hover:shadow-lg md:p-8"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#EAF1F8] text-3xl">
                  {service.icon}
                </div>

                <span className="rounded-sm bg-[#F7F2E6] px-3 py-1 text-[10px] font-bold tracking-wider text-[#A47B29]">
                  {service.label}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#10294D]">
                {service.title}
              </h3>

              <p className="mt-3 min-h-[60px] text-sm leading-6 text-gray-500">
                {service.description}
              </p>

              <button
                onClick={() => setActivePage(service.page)}
                className="mt-6 inline-flex items-center gap-2 border-b-2 border-[#D9B76A] pb-1 text-sm font-bold text-[#10294D] transition hover:gap-3"
              >
                Explore Service
                <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 pt-6 pb-3 text-center">
        <p className="text-sm font-semibold text-[#10294D]">
          CampusConnect | Vikrant University
        </p>

        <p className="mt-2 text-xs text-gray-500">
          A digital platform for student resources and campus assistance.
        </p>
      </footer>

    </div>
  );
}

export default Dashboard;

import { Toaster } from "@/components/ui/sonner";
import {
  BookOpen,
  Calendar,
  Clock,
  LayoutDashboard,
  Menu,
  Target,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Schedule from "./pages/Schedule";
import Sessions from "./pages/Sessions";
import Subjects from "./pages/Subjects";

type Page = "dashboard" | "subjects" | "goals" | "sessions" | "schedule";

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "subjects", label: "Subjects", icon: <BookOpen size={16} /> },
  { id: "goals", label: "Goals", icon: <Target size={16} /> },
  { id: "sessions", label: "Sessions", icon: <Clock size={16} /> },
  { id: "schedule", label: "Schedule", icon: <Calendar size={16} /> },
];

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pageComponents: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={setPage} />,
    subjects: <Subjects />,
    goals: <Goals />,
    sessions: <Sessions />,
    schedule: <Schedule />,
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="nav-gradient sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              type="button"
              onClick={() => setPage("dashboard")}
              className="flex items-center gap-2.5 group"
              data-ocid="nav.logo"
            >
              <div className="w-8 h-8 rounded-lg bg-orange flex items-center justify-center shadow-sm">
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                StudySync
              </span>
            </button>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {navItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  data-ocid={`nav.${item.id}.link`}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    page === item.id
                      ? "bg-white/20 text-white"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen((v) => !v)}
              data-ocid="nav.mobile_menu_toggle"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-white/10"
            >
              <nav className="px-4 py-3 flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    data-ocid={`nav.mobile.${item.id}.link`}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      page === item.id
                        ? "bg-white/20 text-white"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {pageComponents[page]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="nav-gradient py-4 text-center">
        <p className="text-white/60 text-sm">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white underline underline-offset-2 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;

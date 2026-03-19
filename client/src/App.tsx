import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

// Get the base path for GitHub Pages
const getBasePath = () => {
  const href = window.location.href;
  if (href.includes('github.io/dev_metrics')) {
    return '/dev_metrics';
  }
  return '';
};

const BASE_PATH = getBasePath();

function Router() {
  const [location] = useLocation();
  
  // Normalize the location by removing the base path if present
  const normalizedPath = location.startsWith(BASE_PATH) 
    ? location.slice(BASE_PATH.length) || '/'
    : location;

  return (
    <Switch location={normalizedPath}>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

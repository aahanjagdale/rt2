import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Game from "@/pages/game";
import Bucketlist from "@/pages/bucketlist";
import Coupons from "@/pages/coupons";
import Attractions from "@/pages/attractions";
import MainNav from "@/components/layout/main-nav";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/game" component={Game} />
          <Route path="/bucketlist" component={Bucketlist} />
          <Route path="/coupons" component={Coupons} />
          <Route path="/attractions" component={Attractions} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
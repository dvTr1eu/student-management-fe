import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./context/theme-provider";
import { FontProvider } from "./context/font-provider";
import { DirectionProvider } from "./context/direction-provider";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { handleServerError } from "./lib/handle-server-error";
import { showErrorToast } from "@/lib/show-toast-message";
import { useAuthStore } from "./stores/auth-store";
import { useSchoolStore } from "./stores/school-store";
// Generated Routes
import { routeTree } from "./routeTree.gen";
// Styles
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error });

        if (failureCount >= 0 && import.meta.env.DEV) return false;
        if (failureCount > 3 && import.meta.env.PROD) return false;

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        );
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error);

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            showErrorToast("Nội dung chưa được thay đổi.");
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          showErrorToast("Phiên đăng nhập đã hết hạn.");
          useAuthStore.getState().auth.reset();
          useSchoolStore.getState().clearSelectedSchool();
          // const redirect = `${router.history.location.href}`
          // router.navigate({ to: '/sign-in', search: { redirect } })
        }
        if (error.response?.status === 500) {
          showErrorToast("Đã xảy ra lỗi máy chủ.");
          // Only navigate to error page in production to avoid disrupting HMR in development
          if (import.meta.env.PROD) {
            router.navigate({ to: "/500" });
          }
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <RouterProvider router={router} />
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

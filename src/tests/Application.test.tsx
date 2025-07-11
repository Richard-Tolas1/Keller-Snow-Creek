import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "../App";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock data for applications
const mockApplications = [
  {
    guid: "1",
    company: "Tech Corp",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@techcorp.com",
    loan_amount: 50000,
    date_created: "2024-01-15T10:30:00Z",
    expiry_date: "2024-12-15T23:59:59Z",
  },
  {
    guid: "2",
    company: "Innovation Ltd",
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@innovation.com",
    loan_amount: 75000,
    date_created: "2024-02-20T14:15:00Z",
    expiry_date: "2025-01-20T23:59:59Z",
  },
];

const mockMoreApplications = [
  {
    guid: "3",
    company: "Startup Inc",
    first_name: "Bob",
    last_name: "Johnson",
    email: "bob.johnson@startup.com",
    loan_amount: 25000,
    date_created: "2024-03-10T09:00:00Z",
    expiry_date: "2024-11-10T23:59:59Z",
  },
];

describe("Application Integration Tests", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApplications),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("App Rendering and Initial Load", () => {
    it("renders the complete application structure", async () => {
      render(<App />);

      // Check header elements
      expect(screen.getByText("Application Portal")).toBeInTheDocument();
      // Logo is an SVG component, so we'll check for it by class or look for any svg element
      expect(document.querySelector("svg")).toBeInTheDocument();

      // Wait for applications to load
      await waitFor(() => {
        expect(screen.getByText("Tech Corp")).toBeInTheDocument();
      });

      // Check applications section
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Load More")).toBeInTheDocument();
    });

    it("makes initial API call on component mount", async () => {
      render(<App />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/applications?_page=0&_limit=5"
        );
      });
    });

    it("displays application data correctly", async () => {
      render(<App />);

      await waitFor(() => {
        // Check first application
        expect(screen.getByText("Tech Corp")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("john.doe@techcorp.com")).toBeInTheDocument();
        expect(screen.getByText("£50,000")).toBeInTheDocument();

        // Check second application
        expect(screen.getByText("Innovation Ltd")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(
          screen.getByText("jane.smith@innovation.com")
        ).toBeInTheDocument();
        expect(screen.getByText("£75,000")).toBeInTheDocument();
      });
    });

    it("formats dates correctly in dd-mm-yyyy format", async () => {
      render(<App />);

      await waitFor(() => {
        // Check that dates are formatted correctly
        expect(screen.getByText("15-01-2024")).toBeInTheDocument(); // date_created for first app
        expect(screen.getByText("15-12-2024")).toBeInTheDocument(); // expiry_date for first app
        expect(screen.getByText("20-02-2024")).toBeInTheDocument(); // date_created for second app
        expect(screen.getByText("20-01-2025")).toBeInTheDocument(); // expiry_date for second app
      });
    });
  });

  describe("Pagination Functionality", () => {
    it("loads more applications when Load More button is clicked", async () => {
      const user = userEvent.setup();

      // Mock the second API call to return more applications
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockApplications),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMoreApplications),
        });

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("Tech Corp")).toBeInTheDocument();
      });

      // Click Load More button
      const loadMoreButton = screen.getByText("Load More");
      await user.click(loadMoreButton);

      // Check that second API call was made with correct pagination
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/applications?_page=1&_limit=5"
        );
      });

      // Check that new application appears
      await waitFor(() => {
        expect(screen.getByText("Startup Inc")).toBeInTheDocument();
        expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
      });

      // Check that previous applications are still there
      expect(screen.getByText("Tech Corp")).toBeInTheDocument();
      expect(screen.getByText("Innovation Ltd")).toBeInTheDocument();
    });

    it("handles multiple Load More clicks correctly", async () => {
      const user = userEvent.setup();

      // Mock multiple API calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockApplications),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMoreApplications),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        });

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("Tech Corp")).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText("Load More");

      // First click
      await user.click(loadMoreButton);
      await waitFor(() => {
        expect(screen.getByText("Startup Inc")).toBeInTheDocument();
      });

      // Second click
      await user.click(loadMoreButton);

      // Verify API calls were made with correct pagination
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "http://localhost:3001/api/applications?_page=0&_limit=5"
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "http://localhost:3001/api/applications?_page=1&_limit=5"
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        3,
        "http://localhost:3001/api/applications?_page=2&_limit=5"
      );
    });
  });

  describe("Error Handling", () => {
    it("handles API errors gracefully", async () => {
      // Mock fetch to reject
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(<App />);

      // Should still render the app structure even if API fails
      expect(screen.getByText("Application Portal")).toBeInTheDocument();
      expect(screen.getByText("Load More")).toBeInTheDocument();

      // Wait to ensure no applications are displayed
      await waitFor(() => {
        expect(screen.queryByText("Tech Corp")).not.toBeInTheDocument();
      });
    });

    it("handles API returning non-ok response", async () => {
      // Mock fetch to return 404
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "Not found" }),
      });

      render(<App />);

      // Should still render the app structure
      expect(screen.getByText("Application Portal")).toBeInTheDocument();
      expect(screen.getByText("Load More")).toBeInTheDocument();

      // Wait to ensure no applications are displayed
      await waitFor(() => {
        expect(screen.queryByText("Tech Corp")).not.toBeInTheDocument();
      });
    });
  });

  describe("Data Display and Formatting", () => {
    it("displays all required application fields", async () => {
      render(<App />);

      await waitFor(() => {
        // Wait for applications to load first
        expect(screen.getByText("Tech Corp")).toBeInTheDocument();
      });

      // Check that all field labels are present using DOM queries
      // Since labels are in <sub> elements, query directly
      const subElements = document.querySelectorAll("sub");
      const subTexts = Array.from(subElements).map((el) => el.textContent);

      expect(subTexts).toContain("Company");
      expect(subTexts).toContain("Name");
      expect(subTexts).toContain("Email");
      expect(subTexts).toContain("Loan Amount");
      expect(subTexts).toContain("Application Date");
      expect(subTexts).toContain("Expiry date");
    });

    it("formats loan amounts with UK locale and currency symbol", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("£50,000")).toBeInTheDocument();
        expect(screen.getByText("£75,000")).toBeInTheDocument();
      });
    });

    it("handles empty application data", async () => {
      // Mock empty response
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<App />);

      // Should render app structure without applications
      expect(screen.getByText("Application Portal")).toBeInTheDocument();
      expect(screen.getByText("Load More")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText("Tech Corp")).not.toBeInTheDocument();
      });
    });
  });

  describe("User Interactions", () => {
    it("allows users to interact with Load More button multiple times", async () => {
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("Tech Corp")).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText("Load More");

      // Button should be clickable
      expect(loadMoreButton).toBeEnabled();

      // Multiple clicks should work
      await user.click(loadMoreButton);
      await user.click(loadMoreButton);

      // Should have made multiple API calls
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 clicks
    });
  });

  describe("Performance and State Management", () => {
    it("accumulates applications data correctly without replacing previous data", async () => {
      const user = userEvent.setup();

      // Mock different responses for each call
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockApplications),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMoreApplications),
        });

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("Tech Corp")).toBeInTheDocument();
        expect(screen.getByText("Innovation Ltd")).toBeInTheDocument();
      });

      // Click Load More
      await user.click(screen.getByText("Load More"));

      // Both old and new data should be present
      await waitFor(() => {
        expect(screen.getByText("Tech Corp")).toBeInTheDocument(); // Old data
        expect(screen.getByText("Innovation Ltd")).toBeInTheDocument(); // Old data
        expect(screen.getByText("Startup Inc")).toBeInTheDocument(); // New data
      });
    });
  });
});

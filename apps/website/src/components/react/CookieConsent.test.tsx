import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CookieConsent } from "./CookieConsent";

describe("CookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows banner when no consent given", () => {
    render(<CookieConsent />);
    expect(
      screen.getByText(/diese website verwendet cookies/i),
    ).toBeInTheDocument();
  });

  it("hides banner when consent already given", () => {
    localStorage.setItem("cookie-consent", "accepted");
    render(<CookieConsent />);
    expect(
      screen.queryByText(/diese website verwendet cookies/i),
    ).not.toBeInTheDocument();
  });

  it("hides banner on accept click", () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole("button", { name: /akzeptieren/i }));
    expect(
      screen.queryByText(/diese website verwendet cookies/i),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem("cookie-consent")).toBe("accepted");
  });

  it("hides banner on decline click", () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole("button", { name: /nur notwendige/i }));
    expect(
      screen.queryByText(/diese website verwendet cookies/i),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem("cookie-consent")).toBe("declined");
  });

  it("contains link to Datenschutz page", () => {
    render(<CookieConsent />);
    const link = screen.getByRole("link", { name: /datenschutzerklärung/i });
    expect(link).toHaveAttribute("href", "/datenschutz/");
  });
});

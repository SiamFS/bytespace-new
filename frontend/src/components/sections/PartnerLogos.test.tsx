import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PartnerLogos } from "./PartnerLogos";

describe("PartnerLogos", () => {
  it("is a labelled region with five partner logos", () => {
    render(<PartnerLogos />);
    const region = screen.getByRole("region", { name: "Our partners" });
    expect(region).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Logoipsum" })).toHaveLength(5);
  });
});

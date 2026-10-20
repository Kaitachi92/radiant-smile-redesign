import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InstagramSection, type InstagramPost } from "@/components/site/sections";
import { instagram } from "@/lib/site-data";

const posts: InstagramPost[] = [
  {
    id: "post-1",
    permalink: "https://www.instagram.com/p/post-1/",
    mediaUrl: "https://example.com/post-1.jpg",
    mediaType: "IMAGE",
    caption: "Publicação um",
  },
  {
    id: "post-2",
    permalink: "https://www.instagram.com/p/post-2/",
    mediaUrl: "https://example.com/post-2.jpg",
    mediaType: "IMAGE",
    caption: "Publicação dois",
  },
  {
    id: "post-3",
    permalink: "https://www.instagram.com/p/post-3/",
    mediaUrl: "https://example.com/post-3.jpg",
    mediaType: "VIDEO",
    thumbnailUrl: "https://example.com/post-3.jpg",
    caption: "Publicação três",
  },
];

describe("InstagramSection", () => {
  it("shows a transparent unconnected state and links to the official profile", () => {
    render(<InstagramSection />);

    expect(screen.getByRole("status")).toHaveTextContent("aguardando conexão");
    expect(screen.getByRole("link", { name: "Seguir no Instagram" })).toHaveAttribute(
      "href",
      instagram,
    );
    expect(screen.queryByRole("button", { name: "Próxima publicação" })).not.toBeInTheDocument();
  });

  it("opens each post at its original Instagram permalink", () => {
    render(<InstagramSection posts={posts} />);

    expect(screen.getAllByRole("link", { name: /Abrir publicação/ })[0]).toHaveAttribute(
      "href",
      posts[0].permalink,
    );
    expect(screen.getByRole("img", { name: "Publicação três" })).toHaveAttribute(
      "src",
      posts[2].thumbnailUrl,
    );
  });

  it("moves with arrow buttons and position indicators", () => {
    render(<InstagramSection posts={posts} />);

    const previous = screen.getByRole("button", { name: "Publicação anterior" });
    const next = screen.getByRole("button", { name: "Próxima publicação" });
    expect(previous).toBeDisabled();

    fireEvent.click(next);
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(previous).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Ir para publicação 3" }));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    expect(next).toBeDisabled();

    fireEvent.click(previous);
    expect(screen.getByText("2 / 3")).toBeInTheDocument();

    const indicators = screen.getByLabelText("Posição no carrossel");
    expect(within(indicators).getByRole("button", { name: "Ir para publicação 2" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("updates the active position when the touch-scroll track moves", () => {
    render(<InstagramSection posts={posts} />);

    const track = screen.getByRole("region", {
      name: "Publicações do Instagram da Dra. Rebeca Galdino",
    });
    const slides = track.querySelectorAll<HTMLElement>("[data-instagram-slide]");
    const positions = [-340, 0, 320];

    slides.forEach((slide, index) => {
      slide.getBoundingClientRect = () =>
        ({
          left: positions[index],
          right: positions[index] + 280,
          top: 0,
          bottom: 300,
          width: 280,
          height: 300,
          x: positions[index],
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
    });

    fireEvent.scroll(track);

    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });
});

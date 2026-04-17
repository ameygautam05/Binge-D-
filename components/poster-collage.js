import Image from "next/image";

export function PosterCollage({ items }) {
  return (
    <div className="top-collage">
      {items.map((item) => (
        <div className="poster glass" key={item.id}>
          <Image src={item.poster} alt={item.title} fill sizes="(max-width: 720px) 50vw, 14vw" />
          <div className="poster-caption">
            <h4>{item.title}</h4>
            <p>{item.platforms[0]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

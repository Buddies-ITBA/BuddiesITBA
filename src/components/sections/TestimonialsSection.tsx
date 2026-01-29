import Image from 'next/image';

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
};

type TestimonialsSectionProps = {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
};

export function TestimonialsSection({
  title,
  subtitle,
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section className="bg-surface">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-heading">
            {title}
          </h2>
          <p className="mt-2 text-text-muted">{subtitle}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-heading font-semibold text-heading">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-text-muted">{testimonial.role}</p>
                </div>
              </div>
              <p className="mt-4 text-text-muted">“{testimonial.quote}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


import { Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

type ContactSectionProps = {
  addressTitle: string;
  addressLines: string[];
  emailTitle: string;
  email: string;
  emailButtonLabel: string;
};

export function ContactSection({
  addressTitle,
  addressLines,
  emailTitle,
  email,
  emailButtonLabel,
}: ContactSectionProps) {
  return (
    <section className="bg-background">
      <div className="w-full">
        <iframe
          title="Buddies ITBA map"
          className="h-[300px] w-full border-0"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.731039628759!2d-58.40791292435624!3d-34.62779856655948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb6b5f8702d9%3A0xb6fa82f8e04b3dc!2sIguaz%C3%BA%20341%2C%20CABA%2C%20Argentina!5e0!3m2!1ses-419!2sar!4v1696970221668!5m2!1ses-419!2sar"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-heading font-semibold text-heading">
                  {addressTitle}
                </h3>
                {addressLines.map((line) => (
                  <p key={line} className="text-sm text-text-muted">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-heading font-semibold text-heading">
                  {emailTitle}
                </h3>
                <p className="mb-3 text-sm text-text-muted">{email}</p>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <a href={`mailto:${email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {emailButtonLabel}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

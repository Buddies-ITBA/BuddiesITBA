import { Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ContactSectionProps = {
  addressTitle: string;
  addressLines: string[];
  emailTitle: string;
  email: string;
  formNamePlaceholder: string;
  formEmailPlaceholder: string;
  formSubjectPlaceholder: string;
  formMessagePlaceholder: string;
  formSubmitLabel: string;
};

export function ContactSection({
  addressTitle,
  addressLines,
  emailTitle,
  email,
  formNamePlaceholder,
  formEmailPlaceholder,
  formSubjectPlaceholder,
  formMessagePlaceholder,
  formSubmitLabel,
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
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-surface p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary" />
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
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-heading font-semibold text-heading">
                    {emailTitle}
                  </h3>
                  <p className="text-sm text-text-muted">{email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <form
              action="https://formspree.io/f/xwpkojll"
              method="POST"
              className="grid gap-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="name" placeholder={formNamePlaceholder} required />
                <Input
                  name="email"
                  type="email"
                  placeholder={formEmailPlaceholder}
                  required
                />
              </div>
              <Input name="subject" placeholder={formSubjectPlaceholder} required />
              <Textarea
                name="message"
                rows={6}
                placeholder={formMessagePlaceholder}
                required
              />
              <div>
                <Button type="submit" className="bg-primary hover:bg-primary-dark">
                  {formSubmitLabel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}


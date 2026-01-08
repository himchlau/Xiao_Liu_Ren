import { useState } from "react";
import { Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-jade via-gold to-cinnabar bg-clip-text text-transparent">
            {t("日天師傅", "Master Sun Sky")}
          </h2>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === "zh" ? "English" : "中文"}
          </Button>

          <a
            href="https://www.facebook.com/mastersunsky"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground hover:text-primary transition-colors"
          >
            Facebook
          </a>

          <a
            href="#about"
            className="text-sm text-foreground hover:text-primary transition-colors"
          >
            {t("關於小六壬", "About")}
          </a>
        </nav>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  toggleLanguage();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 justify-start"
              >
                <Globe className="h-4 w-4" />
                {language === "zh" ? "Switch to English" : "切換至中文"}
              </Button>

              <div className="border-t pt-4 space-y-2">
                <a
                  href="https://www.facebook.com/mastersunsky"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="block px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="#about"
                  onClick={() => setIsOpen(false)}
                  className="block px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                >
                  {t("關於小六壬", "About Xiao Liu Ren")}
                </a>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

import { useState } from "react";
import { Menu } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const services = [{
    name: "小六壬占卜 / Xiao Liu Ren Divination",
    href: "#divination"
  }, {
    name: "命理諮詢 / Fortune Consultation",
    href: "#consultation"
  }, {
    name: "風水建議 / Feng Shui Advice",
    href: "#fengshui"
  }, {
    name: "擇日服務 / Date Selection",
    href: "#dateselection"
  }];
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-jade via-gold to-cinnabar bg-clip-text text-transparent">日天師傅 Master Sun Sky</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm">
                  服務項目 / Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-3 p-4">
                    {services.map(service => <li key={service.name}>
                        <NavigationMenuLink asChild>
                          <a href={service.href} className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">
                              {service.name}
                            </div>
                          </a>
                        </NavigationMenuLink>
                      </li>)}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <a href="https://www.facebook.com/mastersunsky" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground hover:text-primary transition-colors">
            Facebook
          </a>

          <a href="#about" className="text-sm text-foreground hover:text-primary transition-colors">
            關於小六壬 / About
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
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground px-2">
                  服務項目 / Services
                </h3>
                {services.map(service => <a key={service.name} href={service.href} onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors">
                    {service.name}
                  </a>)}
              </div>

              <div className="border-t pt-4 space-y-2">
                <a href="https://www.facebook.com/mastersunsky" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors">
                  Facebook
                </a>
                <a href="#about" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors">
                  關於小六壬 / About Xiao Liu Ren
                </a>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>;
};
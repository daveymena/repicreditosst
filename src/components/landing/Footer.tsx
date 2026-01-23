import { Link } from "react-router-dom";
import { Banknote } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Banknote className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">RapiCréditos</span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link to="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Características
            </Link>
            <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="text-muted-foreground hover:text-primary transition-colors">
              Registrarse
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2024 RapiCréditos. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

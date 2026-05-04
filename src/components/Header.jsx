function Header({ activePage, onNavigate, onLogout, user }) {
  const linkClass = (page) => `nav-link ${activePage === page ? 'active' : ''}`;
  const scrollToSection = (sectionId) => {
    onNavigate('home');
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <header className="site-header">
      <button className="brand" onClick={() => onNavigate('home')} aria-label="SPACE - главная">
        <span className="brand-mark">S</span>
        <span>
          <strong>SPACE</strong>
          <small>rhythmic academy</small>
        </span>
      </button>

      <nav className="main-nav" aria-label="Основная навигация">
        <button className={linkClass('home')} onClick={() => onNavigate('home')}>
          Главная
        </button>
        <button className={linkClass('trainers')} onClick={() => onNavigate('trainers')}>
          Тренеры
        </button>
        <button className="nav-link" onClick={() => scrollToSection('about')}>
          О нас
        </button>
        <button className="nav-link" onClick={() => scrollToSection('contacts')}>
          Контакты
        </button>
      </nav>

      <div className="header-actions">
        <span className="user-phone">{user.phone}</span>
        <button className="ghost-button" onClick={onLogout}>
          Выйти
        </button>
      </div>
    </header>
  );
}

export default Header;

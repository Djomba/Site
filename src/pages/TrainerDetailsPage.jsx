function TrainerDetailsPage({ trainer, onNavigate, user }) {
  return (
    <section className="page-section trainer-details-page">
      <button className="back-button" onClick={() => onNavigate('trainers')}>
        Назад к тренерам
      </button>

      <article className="trainer-details">
        <div className={`trainer-details-portrait trainer-portrait ${trainer.portraitClass}`}>
          <img src={trainer.photo} alt={`Тренер ${trainer.name}`} />
          <span className="portrait-ribbon" />
        </div>

        <div className="trainer-details-content">
          <span className="trainer-role">{trainer.role}</span>
          <h1>{trainer.name}</h1>
          <div className="details-meta">
            <span>Опыт: {trainer.experience}</span>
            <span>Специализация: {trainer.specialization}</span>
          </div>
          <p>{trainer.detailedDescription}</p>

          <div className="detail-columns">
            <div>
              <h3>Сильные стороны</h3>
              <ul>
                {trainer.strengths.map((strength) => (
                  <li key={strength}>{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Возрастные группы</h3>
              <p>{trainer.ageGroups}</p>
              <h3>Формат занятий</h3>
              <p>{trainer.trainingFormat}</p>
            </div>
          </div>
        </div>
      </article>

      <section className="confirmation-card">
        <span className="confirmation-icon">✓</span>
        <div>
          <h2>Заявка отправлена</h2>
          <p>Спасибо за выбор тренера. Администратор академии SPACE свяжется с вами в ближайшее время для уточнения деталей.</p>
          <p>Пожалуйста, ожидайте звонка на номер, указанный при авторизации: {user.phone}.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate('home')}>
          Вернуться на главную
        </button>
      </section>
    </section>
  );
}

export default TrainerDetailsPage;

.
├── angular.json
├── netlify.toml
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── app
│   │   ├── app.component.html
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── components
│   │   │   ├── chart
│   │   │   │   ├── chart.component.html
│   │   │   │   ├── chart.component.scss
│   │   │   │   └── chart.component.ts
│   │   │   ├── mathew-anderson
│   │   │   │   ├── mathew-anderson.component.html
│   │   │   │   └── mathew-anderson.component.ts
│   │   │   ├── monthly-earnings
│   │   │   │   ├── monthly-earnings.component.html
│   │   │   │   └── monthly-earnings.component.ts
│   │   │   ├── recent-transactions
│   │   │   │   ├── recent-transactions.component.html
│   │   │   │   └── recent-transactions.component.ts
│   │   │   ├── report-chat
│   │   │   │   ├── report-chat.component.html
│   │   │   │   ├── report-chat.component.scss
│   │   │   │   └── report-chat.component.ts
│   │   │   ├── revenue-updates
│   │   │   │   ├── revenue-updates.component.html
│   │   │   │   └── revenue-updates.component.ts
│   │   │   ├── top-cards
│   │   │   │   ├── top-cards.component.html
│   │   │   │   └── top-cards.component.ts
│   │   │   ├── top-projects
│   │   │   │   ├── top-projects.component.html
│   │   │   │   └── top-projects.component.ts
│   │   │   └── yearly-breakup
│   │   │       ├── yearly-breakup.component.html
│   │   │       └── yearly-breakup.component.ts
│   │   ├── config.ts
│   │   ├── guards
│   │   │   ├── authenticated.guard.ts
│   │   │   └── no-authenticated.guard.ts
│   │   ├── layouts
│   │   │   ├── blank
│   │   │   │   ├── blank.component.html
│   │   │   │   └── blank.component.ts
│   │   │   └── full
│   │   │       ├── full.component.html
│   │   │       ├── full.component.ts
│   │   │       ├── header
│   │   │       │   ├── header.component.html
│   │   │       │   └── header.component.ts
│   │   │       └── sidebar
│   │   │           ├── branding.component.ts
│   │   │           ├── nav-item
│   │   │           │   ├── nav-item.component.html
│   │   │           │   ├── nav-item.component.ts
│   │   │           │   └── nav-item.ts
│   │   │           ├── sidebar.component.html
│   │   │           ├── sidebar.component.ts
│   │   │           ├── sidebar-data.backup.ts
│   │   │           └── sidebar-data.ts
│   │   ├── material.module.ts
│   │   ├── models
│   │   │   ├── auth
│   │   │   │   ├── auth-provider.enum.ts
│   │   │   │   └── user-role.enum.ts
│   │   │   ├── report-response.model.ts
│   │   │   └── user.ts
│   │   ├── pages
│   │   │   ├── anotaciones
│   │   │   │   ├── anotaciones.routes.ts
│   │   │   │   ├── crear
│   │   │   │   │   ├── crear.component.html
│   │   │   │   │   ├── crear.component.scss
│   │   │   │   │   └── crear.component.ts
│   │   │   │   ├── evidencias
│   │   │   │   │   ├── evidencias.component.html
│   │   │   │   │   ├── evidencias.component.scss
│   │   │   │   │   └── evidencias.component.ts
│   │   │   │   └── visualizar
│   │   │   │       ├── visualizar.component.html
│   │   │   │       ├── visualizar.component.scss
│   │   │   │       └── visualizar.component.ts
│   │   │   ├── authentication
│   │   │   │   ├── authentication.routes.ts
│   │   │   │   ├── side-login
│   │   │   │   │   ├── side-login.component.html
│   │   │   │   │   └── side-login.component.ts
│   │   │   │   └── side-register
│   │   │   │       ├── side-register.component.html
│   │   │   │       └── side-register.component.ts
│   │   │   ├── extra
│   │   │   │   ├── extra.routes.ts
│   │   │   │   ├── icons
│   │   │   │   │   ├── icons.component.html
│   │   │   │   │   └── icons.component.ts
│   │   │   │   └── sample-page
│   │   │   │       ├── sample-page.component.html
│   │   │   │       └── sample-page.component.ts
│   │   │   ├── mapa-territorial
│   │   │   │   ├── components
│   │   │   │   │   ├── anotacion-detalle
│   │   │   │   │   │   ├── anotacion-detalle.component.html
│   │   │   │   │   │   ├── anotacion-detalle.component.scss
│   │   │   │   │   │   ├── anotacion-detalle.component.spec.ts
│   │   │   │   │   │   └── anotacion-detalle.component.ts
│   │   │   │   │   ├── anotacion-form
│   │   │   │   │   │   ├── anotacion-form.component.html
│   │   │   │   │   │   ├── anotacion-form.component.scss
│   │   │   │   │   │   └── anotacion-form.component.ts
│   │   │   │   │   ├── demarcacion-panel
│   │   │   │   │   │   ├── demarcacion-panel.component.html
│   │   │   │   │   │   ├── demarcacion-panel.component.scss
│   │   │   │   │   │   └── demarcacion-panel.component.ts
│   │   │   │   │   ├── demarcacion-sidebar
│   │   │   │   │   │   ├── demarcacion-sidebar.component.html
│   │   │   │   │   │   ├── demarcacion-sidebar.component.scss
│   │   │   │   │   │   └── demarcacion-sidebar.component.ts
│   │   │   │   │   ├── filtros-panel
│   │   │   │   │   │   ├── filtros-panel.component.html
│   │   │   │   │   │   ├── filtros-panel.component.scss
│   │   │   │   │   │   ├── filtros-panel.component.spec.ts
│   │   │   │   │   │   └── filtros-panel.component.ts
│   │   │   │   │   ├── mapa-base
│   │   │   │   │   │   ├── mapa-base.component.html
│   │   │   │   │   │   ├── mapa-base.component.scss
│   │   │   │   │   │   ├── mapa-base.component.ts
│   │   │   │   │   │   ├── mapa-base-layer.model.ts
│   │   │   │   │   │   └── mapa-base-layers.ts
│   │   │   │   │   └── tracking-panel
│   │   │   │   │       ├── tracking-panel.component.html
│   │   │   │   │       ├── tracking-panel.component.scss
│   │   │   │   │       └── tracking-panel.component.ts
│   │   │   │   ├── mapa-anotar
│   │   │   │   │   ├── components
│   │   │   │   │   │   └── anotar-filters-bar
│   │   │   │   │   │       ├── anotar-filters-bar.component.html
│   │   │   │   │   │       ├── anotar-filters-bar.component.scss
│   │   │   │   │   │       └── anotar-filters-bar.component.ts
│   │   │   │   │   ├── mapa-anotar-page.component.html
│   │   │   │   │   ├── mapa-anotar-page.component.scss
│   │   │   │   │   └── mapa-anotar-page.component.ts
│   │   │   │   ├── mapa-demarcacion
│   │   │   │   │   └── pages
│   │   │   │   │       ├── mapa-demarcacion-page.component.html
│   │   │   │   │       ├── mapa-demarcacion-page.component.scss
│   │   │   │   │       └── mapa-demarcacion-page.component.ts
│   │   │   │   ├── mapa-filtros
│   │   │   │   │   ├── mapa-filtros-page.component.html
│   │   │   │   │   ├── mapa-filtros-page.component.scss
│   │   │   │   │   └── mapa-filtros-page.component.ts
│   │   │   │   ├── mapa-home
│   │   │   │   │   ├── mapa-home.component.html
│   │   │   │   │   ├── mapa-home.component.scss
│   │   │   │   │   ├── mapa-home.component.ts
│   │   │   │   │   ├── mapa-home-option.model.ts
│   │   │   │   │   └── mapa-home.service.ts
│   │   │   │   ├── mapa-seguimiento
│   │   │   │   │   ├── components
│   │   │   │   │   │   └── seguimiento-stats-bar
│   │   │   │   │   │       ├── seguimiento-stats-bar.component.html
│   │   │   │   │   │       ├── seguimiento-stats-bar.component.scss
│   │   │   │   │   │       └── seguimiento-stats-bar.component.ts
│   │   │   │   │   ├── mapa-seguimiento-page.component.html
│   │   │   │   │   ├── mapa-seguimiento-page.component.scss
│   │   │   │   │   └── mapa-seguimiento-page.component.ts
│   │   │   │   ├── mapa-territorial.component.html
│   │   │   │   ├── mapa-territorial.component.scss
│   │   │   │   ├── mapa-territorial.component.spec.ts
│   │   │   │   ├── mapa-territorial.component.ts
│   │   │   │   ├── mapa-territorial.routes.ts
│   │   │   │   ├── mapa-ver
│   │   │   │   │   ├── mapa-ver.component.html
│   │   │   │   │   ├── mapa-ver.component.scss
│   │   │   │   │   └── mapa-ver.component.ts
│   │   │   │   ├── models
│   │   │   │   │   ├── annotation-category.model.ts
│   │   │   │   │   ├── annotation.model.ts
│   │   │   │   │   ├── barrio.model.ts
│   │   │   │   │   ├── barrio.ts
│   │   │   │   │   ├── category.model.ts
│   │   │   │   │   ├── entity.model.ts
│   │   │   │   │   ├── evidence.model.ts
│   │   │   │   │   ├── official.model.ts
│   │   │   │   │   └── vote.model.ts
│   │   │   │   └── services
│   │   │   │       ├── annotation-categories.service.spec.ts
│   │   │   │       ├── annotation-categories.service.ts
│   │   │   │       ├── annotations.service.spec.ts
│   │   │   │       ├── annotations.service.ts
│   │   │   │       ├── anotacion-form.service.ts
│   │   │   │       ├── barrios.service.ts
│   │   │   │       ├── categories.service.spec.ts
│   │   │   │       ├── categories.service.ts
│   │   │   │       ├── entities.service.ts
│   │   │   │       ├── evidences.service.ts
│   │   │   │       ├── interested-parties.service.ts
│   │   │   │       ├── official-markers.service.ts
│   │   │   │       ├── officials.service.ts
│   │   │   │       └── votes.service.ts
│   │   │   ├── pages.routes.ts
│   │   │   ├── reportes-page
│   │   │   │   ├── reportes-page.component.html
│   │   │   │   ├── reportes-page.component.scss
│   │   │   │   ├── reportes-page.component.ts
│   │   │   │   └── reportes.routes.ts
│   │   │   ├── starter
│   │   │   │   ├── starter.component.html
│   │   │   │   └── starter.component.ts
│   │   │   ├── ui-components
│   │   │   │   ├── badge
│   │   │   │   │   ├── badge.component.html
│   │   │   │   │   └── badge.component.ts
│   │   │   │   ├── chips
│   │   │   │   │   ├── chips.component.html
│   │   │   │   │   ├── chips.component.scss
│   │   │   │   │   └── chips.component.ts
│   │   │   │   ├── forms
│   │   │   │   │   ├── forms.component.html
│   │   │   │   │   └── forms.component.ts
│   │   │   │   ├── lists
│   │   │   │   │   ├── lists.component.html
│   │   │   │   │   └── lists.component.ts
│   │   │   │   ├── menu
│   │   │   │   │   ├── menu.component.html
│   │   │   │   │   └── menu.component.ts
│   │   │   │   ├── tables
│   │   │   │   │   ├── tables.component.html
│   │   │   │   │   └── tables.component.ts
│   │   │   │   ├── tooltips
│   │   │   │   │   ├── tooltips.component.html
│   │   │   │   │   └── tooltips.component.ts
│   │   │   │   └── ui-components.routes.ts
│   │   │   └── users
│   │   │       ├── list
│   │   │       │   ├── list.component.html
│   │   │       │   ├── list.component.scss
│   │   │       │   ├── list.component.spec.ts
│   │   │       │   └── list.component.ts
│   │   │       └── users.routes.ts
│   │   ├── pipe
│   │   │   └── filter.pipe.ts
│   │   └── services
│   │       ├── auth.service.ts
│   │       ├── core.service.ts
│   │       ├── nav.service.ts
│   │       ├── reports.service.ts
│   │       └── storage
│   │           ├── storage.service.interface.ts
│   │           └── storage.service.ts
│   ├── assets
│   │   ├── i18n
│   │   │   ├── de.json
│   │   │   ├── en.json
│   │   │   ├── es.json
│   │   │   └── fr.json
│   │   ├── images
│   │   │   ├── backgrounds
│   │   │   │   ├── bronze.png
│   │   │   │   ├── customer-support-img.png
│   │   │   │   ├── error404page.gif
│   │   │   │   ├── gold.png
│   │   │   │   ├── laptop-desk.webp
│   │   │   │   ├── login-bg.svg
│   │   │   │   ├── maintenance.gif
│   │   │   │   ├── onlinedoctor.gif
│   │   │   │   ├── piggy.png
│   │   │   │   ├── profilebg.jpg
│   │   │   │   ├── rocket.png
│   │   │   │   ├── silver.png
│   │   │   │   └── welcome-bg2.png
│   │   │   ├── breadcrumb
│   │   │   │   ├── ChatBc.png
│   │   │   │   └── emailSv.png
│   │   │   ├── flag
│   │   │   │   ├── icon-flag-de.svg
│   │   │   │   ├── icon-flag-en.svg
│   │   │   │   ├── icon-flag-es.svg
│   │   │   │   └── icon-flag-fr.svg
│   │   │   ├── logos
│   │   │   │   ├── dark-logo.svg
│   │   │   │   └── light-logo.svg
│   │   │   ├── products
│   │   │   │   ├── product-1.jpg
│   │   │   │   ├── product-2.jpg
│   │   │   │   ├── product-3.jpg
│   │   │   │   └── product-4.jpg
│   │   │   ├── profile
│   │   │   │   ├── user-10.jpg
│   │   │   │   ├── user-11.jpg
│   │   │   │   ├── user-12.jpg
│   │   │   │   ├── user-1.jpg
│   │   │   │   ├── user-2.jpg
│   │   │   │   ├── user-3.jpg
│   │   │   │   ├── user-4.jpg
│   │   │   │   ├── user-5.jpg
│   │   │   │   ├── user-6.jpg
│   │   │   │   ├── user-7.jpg
│   │   │   │   ├── user-8.jpg
│   │   │   │   └── user-9.jpg
│   │   │   └── svgs
│   │   │       ├── facebook-icon.svg
│   │   │       ├── github-icon.svg
│   │   │       ├── google-icon.svg
│   │   │       ├── icon-account.svg
│   │   │       ├── icon-briefcase.svg
│   │   │       ├── icon-connect.svg
│   │   │       ├── icon-dd-application.svg
│   │   │       ├── icon-dd-cart.svg
│   │   │       ├── icon-dd-chat.svg
│   │   │       ├── icon-dd-date.svg
│   │   │       ├── icon-dd-invoice.svg
│   │   │       ├── icon-dd-lifebuoy.svg
│   │   │       ├── icon-dd-message-box.svg
│   │   │       ├── icon-dd-mobile.svg
│   │   │       ├── icon-favorites.svg
│   │   │       ├── icon-inbox.svg
│   │   │       ├── icon-mailbox.svg
│   │   │       ├── icon-master-card-2.svg
│   │   │       ├── icon-master-card.svg
│   │   │       ├── icon-nextjs.svg
│   │   │       ├── icon-office-bag-2.svg
│   │   │       ├── icon-office-bag.svg
│   │   │       ├── icon-paypal.svg
│   │   │       ├── icon-pie.svg
│   │   │       ├── icon-react.svg
│   │   │       ├── icon-speech-bubble.svg
│   │   │       ├── icon-tailwind.svg
│   │   │       ├── icon-tasks.svg
│   │   │       ├── icon-typescript.svg
│   │   │       ├── icon-user-male.svg
│   │   │       ├── mastercard.svg
│   │   │       └── paypal.svg
│   │   ├── marker-icon-2x.png
│   │   ├── marker-icon.png
│   │   ├── marker-shadow.png
│   │   └── scss
│   │       ├── _container.scss
│   │       ├── dark
│   │       │   └── _dark.scss
│   │       ├── layouts
│   │       │   ├── _header.scss
│   │       │   ├── _layouts.scss
│   │       │   ├── _sidebar.scss
│   │       │   └── _transitions.scss
│   │       ├── override-component
│   │       │   ├── _autocomplete.scss
│   │       │   ├── _badge.scss
│   │       │   ├── _button.scss
│   │       │   ├── _button-toggle.scss
│   │       │   ├── _card.scss
│   │       │   ├── _checkbox.scss
│   │       │   ├── _chip.scss
│   │       │   ├── _datepicker.scss
│   │       │   ├── _dialog.scss
│   │       │   ├── _drawer.scss
│   │       │   ├── _expansion.scss
│   │       │   ├── _fab.scss
│   │       │   ├── _form-field.scss
│   │       │   ├── _index.scss
│   │       │   ├── _list.scss
│   │       │   ├── _menu.scss
│   │       │   ├── _paginator.scss
│   │       │   ├── _progress.scss
│   │       │   ├── _radio.scss
│   │       │   ├── _stepper.scss
│   │       │   ├── _table.scss
│   │       │   ├── _theme.scss
│   │       │   ├── _tree.scss
│   │       │   └── _typography.scss
│   │       ├── pages
│   │       │   ├── _auth.scss
│   │       │   └── _dashboards.scss
│   │       ├── style.scss
│   │       ├── themecolors
│   │       │   ├── _aqua_theme.scss
│   │       │   ├── _blue_theme.scss
│   │       │   ├── _cyan_theme.scss
│   │       │   ├── _green_theme.scss
│   │       │   ├── _orange_theme.scss
│   │       │   └── _purple_theme.scss
│   │       ├── theme-variables
│   │       │   ├── _dark-theme-variables.scss
│   │       │   ├── _default-variables.scss
│   │       │   └── _light-theme-variables.scss
│   │       └── _variables.scss
│   ├── environments
│   │   ├── environment.prod.ts
│   │   └── environment.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── index.html
│   ├── main.ts
│   ├── proxy.conf.json
│   └── styles.scss
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json

87 directories, 316 files

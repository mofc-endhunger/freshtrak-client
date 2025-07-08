import LocalizedStrings from "react-localization";

interface LocalizationStrings {
	home_freshtrack: string;
	home_stay: string;
	home_findfood: string;
	home_comming_soon: string;
	home_zip_details: string;
	home_header_component: string;
	home_dashboard: string;
	home_dashboard_org: string;
	home_before_footer1: string;
	home_before_footer2: string;
	home_before_footer3: string;
	home_before_footer1_header: string;
	home_before_footer2_header: string;
	home_before_footer3_header: string;
	search_for_resources: string;
	resource_zip_code: string;
	resource_zip_code_events: string;
	no_events_scheduled: string;
	refine_your_results: string;
	by_distance: string;
	by_service_catogory: string;
	register: string;
	save_time: string;
	stay_safe: string;
	register_who_are_you: string;
	first_name: string;
	middle_name: string;
	last_name: string;
	suffix: string;
	dob: string;
	gender: string;
	register_where_you_live: string;
	street_address: string;
	lot_suite: string;
	city: string;
	state: string;
	zip_code: string;
	register_how_to_contact: string;
	phone_number: string;
	no_phone: string;
	phone_contact_you: string;
	no_email: string;
	email_contact_you: string;
	register_about_family: string;
	family_count: string;
	seniors: string;
	adults: string;
	kids: string;
	license_plate: string;
	arrive_disribution: string;
	house_hold_zip: string;
	registartion_register: string;
	for_foodbanks: string;
	advance_registration: string;
	by_registration: string;
	male: string;
	female: string;
	other: string;
	not_to_say: string;
}

const localization = new LocalizedStrings<LocalizationStrings>({
	en: {
		home_freshtrack: "FreshTrak is here to help!",
		home_stay: "Stay Up to Date",
		home_findfood: "Find Food",
		home_comming_soon:
			"Coming soon... Make a FreshTrak account to stay up to date on local food access events.",
		home_zip_details:
			"Enter your zip code and get connected to food access resources in your community.",
		home_header_component:
			"We're here to help! Input your zip code to find food access resources in your community.",
		home_dashboard: "Serve More Families",
		home_dashboard_org:
			"Prepare your organization for the influx of demand for food by streamlining registration, planning service windows, and forecasting needs. Serve more families—both current and new—in your community.",
		home_before_footer1:
			"Register neighbors ahead of time or,where possible, schedule a pick-up appointment, your organization can plan for any increase in demand.",
		home_before_footer2:
			'You post food access "events" in your community—anything from daily pantry hours to pop-up food events—and neighbors enter their zip code to get connected to them.',
		home_before_footer3:
			"Remove the bottleneck from distribution with online customer pre-registration. Serve more customers, safely!",
		home_before_footer1_header: "Predict Need",
		home_before_footer2_header: "Serve Food",
		home_before_footer3_header: "Move Quickly",
		search_for_resources: "Search For Resources",
		resource_zip_code: "Resource Events In Zip Code",
		resource_zip_code_events:
			"Resource Events Serving Residents of Zip Code",
		no_events_scheduled: "No Events Currently Scheduled",
		refine_your_results: "REFINE YOUR RESULTS",
		by_distance: "by Distance",
		by_service_catogory: "by Service Category",
		register: "Register Now.",
		save_time: "Save Time.",
		stay_safe: "Stay Safe.",
		register_who_are_you: "Who you are",
		first_name: "First Name",
		middle_name: "Middle Name",
		last_name: "Last Name",
		suffix: "Suffix",
		dob: "Date of Birth",
		gender: "Gender",
		register_where_you_live: "Where you live",
		street_address: "Street Address",
		lot_suite: "apt/lot/suite",
		city: "City",
		state: "State",
		zip_code: "Zip Code",
		register_how_to_contact: "How to Contact You",
		phone_number: "Phone Number (Mobile Preferred)",
		no_phone: "No Phone Available",
		phone_contact_you:
			"Is it okay to contact you with updates and information about your registration, and updates to our network?",
		no_email: "No Email Available",
		email_contact_you:
			"Is it okay to email you with updates and information about your registration, and updates to our network?",
		register_about_family: "Tell us about your family",
		family_count:
			"How many additional family members are in each age group? (Do not include yourself)",
		seniors: "Seniors",
		adults: "Adults",
		kids: "Kids",
		license_plate: "License Plate",
		arrive_disribution:
			"If you will arrive at the distribution in a vehicle and know the license plate, please include it here. Sharing your license plate enables expedited check-in at some distributions.",
		house_hold_zip: "Household Zip code",
		registartion_register: "Register",
		for_foodbanks: "For Foodbanks",
		advance_registration: "Registering in advance is",
		by_registration:
			"By registering now, you can save time time on-site and keep yourself and our volunteers safe.",
		male: "Male",
		female: "Female",
		other: "Other",
		not_to_say: "Prefer Not To Specify",
	},
	spa: {
		home_freshtrack: "FreshTrak está aquí para ayudar!",
		home_stay: "manténgase al tanto",
		home_findfood: "Encontrar comida",
		home_comming_soon:
			"Próximamente ... Cree una cuenta FreshTrak para mantenerse al tanto sobre los eventos locales de acceso a alimentos.",
		home_zip_details:
			"Rellena con su código postal y conéctese a los recursos de acceso a alimentos en su comunidad.",
		home_header_component:
			"¡Estamos aquí para ayudar! Rellena con su código postalpara encontrar recursos de acceso a alimentos en su comunidad.",
		home_dashboard: "Proporciona más familias",
		home_dashboard_org:
			"Prepara su organización para la abundancia de demanda de alimentos mediante la optimización del registro, la planificación de las ventanasde servicio y la previsión de necesidades. Sirva a más familias, tanto nuevas como actuales, en su comunidad.",
		home_before_footer1:
			"Registre a los vecinos con anticipación o, cuando sea posible, programe una cita de recogida, su organización puede planificar cualquier aumento en la demanda.",
		home_before_footer2:
			"Usted publica eventos de acceso a alimentos en su comunidad, desde el horario diario de la despensa hasta eventos emergentes de alimentos, y los vecinos rellenan sus códigos postals para conectarse con ellos.",
		home_before_footer3:
			"Elimine el cuello de botella de la distribución con el registro previo del cliente en línea. ¡Atienda a más clientes de forma segura!",
		home_before_footer1_header: "Pronostica la necesidad",
		home_before_footer2_header: "Servir comida",
		home_before_footer3_header: "Muévete rápido",
		search_for_resources: "Buscar recursos",
		resource_zip_code: "Eventos de recursos en código postal",
		resource_zip_code_events:
			"Eventos de recursos que sirven a los residentes del código postal",
		no_events_scheduled: "No hay eventos programados actualmente",
		refine_your_results: "REFINA TUS RESULTADOS",
		by_distance: "a distancia",
		by_service_catogory: "por categoría de servicio",
		register: "Regístrate ahora.",
		save_time: "Ahorrar tiempo.",
		stay_safe: "Mantente segura",
		register_who_are_you: "Quien eres",
		first_name: "Nombre",
		middle_name: "segundo nombre",
		last_name: "apellido",
		suffix: "Sufijo",
		dob: "Fecha de nacimiento",
		gender: "Género",
		register_where_you_live: "Donde vives",
		street_address: "Dirección",
		lot_suite: "apto/lote/suite",
		city: "Ciudad",
		state: "Estado",
		zip_code: "Código postal",
		register_how_to_contact: "Cómo contactarlo",
		phone_number: "Número de teléfono (móvil preferido)",
		no_phone: "No hay teléfono disponible",
		phone_contact_you:
			"¿Está bien comunicarnos con usted con actualizaciones e información sobre su registro y actualizaciones de nuestra red?",
		no_email: "No hay correo electrónico disponible",
		email_contact_you:
			"¿Está bien enviarle un correo electrónico con actualizaciones e información sobre su registro y actualizaciones de nuestra red?",
		register_about_family: "Háblanos de tu familia",
		family_count:
			"¿Cuántos miembros adicionales de la familia hay en cada grupo de edad? (No te incluyas a ti mismo)",
		seniors: "Personas mayores",
		adults: "Adultas",
		kids: "Niñas/Niños",
		license_plate: "Matrícula",
		arrive_disribution:
			"Si va a llegar a la distribución en un vehículo y sabe laplaca, inclúyala aquí. Compartir su matrícula permite hacer el check-in rápido enalgunas distribuciones.",
		house_hold_zip: "Código postal del hogar",
		registartion_register: "Registrarse",
		for_foodbanks: "Para bancos de alimentos",
		advance_registration: "Registrarse con anticipación es",
		by_registration:
			"Al registrarse ahora, puede ahorrar tiempo en el sitio y mantenerse a salvo a usted y a nuestros voluntarios.",
		male: "Masculina",
		female: "Mujer",
		other: "Otra/Otro",
		not_to_say: "Prefiero no especificar",
	},
	// Add other languages as needed...
});

export default localization;

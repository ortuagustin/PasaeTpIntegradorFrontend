package ar.edu.unlp.pasae.tp_integrador_frontend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {

	/**
	 * Genera una redireccion para evitar URLs envalidas
	 * en el frontend
	 */
	@Override
	public void addViewControllers(ViewControllerRegistry registry) {
		registry.addRedirectViewController("", "/app/");
		registry.addRedirectViewController("/", "/app/");
		registry.addRedirectViewController("/app/**", "/");
	}
}
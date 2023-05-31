export default class Logger {
	namespace: string;
	separator: string;
	constructor(namespace: string, options: Record<string, unknown>) {
		this.namespace = namespace;
	}

	log(msg: string, component: string | null = null) {
		
	}
}

all: clean client

client: public/app.js

components: 
	component install

public/app.js: components
	component-build -o public -n app
	echo \\nrequire\(\'boot\'\)\; >> public/app.js

clean: 
	rm public/app.js

.PHONY: client
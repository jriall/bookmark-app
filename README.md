## URL Bookmark App

# To Do

- The application should be accompanied by a brief TDD (Technical Design Document) outlining the solution’s design and any limitations.

# Failed
- Where applicable, all code should follow the Google style guidelines.
- Try and validate edited URL addresses.
- All JavaScript should be compiled into a single minified file using the Google Closure Compiler (using the command line compiler) with advanced optimisations. Did not have time unfortunately to figure out how to fix these two error messages:

src/js/main.min.js:229 (JSC_USED_GLOBAL_THIS)
dangerous use of the global 'this' object
    let parsedURL = this.responseURL.replace(
                    ^

src/js/main.min.js:50 (JSC_UNDEFINED_VARIABLE)
variable localStorage is undeclared
  if (localStorage.updatedData) {
      ^

# Limitations
- Really long URLs on small screens.

# Would add next time
- Unit testing

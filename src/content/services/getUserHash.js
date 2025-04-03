const pageHTML = document.documentElement.outerHTML;

const hashMatch = pageHTML.match(/dle_login_hash\s*=\s*['"]([^'"]+)['"]/);

const dle_login_hash = hashMatch[1]
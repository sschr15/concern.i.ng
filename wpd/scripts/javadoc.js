
const javadocs = document.querySelectorAll('a[javadoc]');

for (const javadoc of javadocs) {
    let module
    if (javadoc.module) {
        module = javadoc.module;
    } else {
        module = "java.base";
    }
    javadoc.href = `https://docs.oracle.com/en/java/javase/17/docs/api/${module}/${javadoc.getAttribute('javadoc')}`;
    javadoc.target = '_blank';
    javadoc.style = "font-family: 'JetBrains Mono', monospace;";
}
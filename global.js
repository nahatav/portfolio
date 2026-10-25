console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 3: Automatic navigation menu
let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'cv/', title: 'CV' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/nahatav', title: 'GitHub' },
];

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/'
    : '/portfolio/';

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname,
  );

  if (a.host !== location.host) {
    a.target = '_blank';
  }

  nav.append(a);
}

// Step 4: Dark mode switch
document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value="light dark">Automatic</option>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
		</select>
	</label>`,
);

let select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  localStorage.colorScheme = event.target.value;
  setColorScheme(event.target.value);
});

// Step 5: Better contact form
let form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
  event.preventDefault();
  let data = new FormData(form);
  let params = [];
  for (let [name, value] of data) {
    params.push(`${name}=${encodeURIComponent(value)}`);
  }
  let url = `${form.action}?${params.join('&')}`;
  location.href = url;
});

// Lab 4: Fetching JSON and rendering projects
export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) return;
  containerElement.innerHTML = '';

  const list = Array.isArray(projects) ? projects : [projects];
  for (const project of list) {
    const article = document.createElement('article');
    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p>
    `;
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

export const fetchGithubData = fetchGitHubData;

		(() => {
			const storageKey = "safa-screening-room-watchlist";
			const watchList = document.querySelector("#watch-list");
			const watchForm = document.querySelector("#watch-form");
			const titleInput = document.querySelector("#movie-title");
			const count = document.querySelector("#watch-count");
			const posterCards = [...document.querySelectorAll(".poster-card")];
			const posterFilters = [...document.querySelectorAll(".poster-filter")];
			let storageUnavailable = false;

			const revealTargets = document.querySelectorAll(".intro, .movie-wall-heading, .shelf-heading, .side-note, .closing, .shelf-list, .add-form");
			revealTargets.forEach((el) => el.classList.add("reveal"));
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						observer.unobserve(entry.target);
					}
				});
			}, { threshold: 0.12 });
			revealTargets.forEach((el) => observer.observe(el));

			posterCards.forEach((card) => {
				const image = card.querySelector("img");
				image.addEventListener("error", () => {
					image.remove();
					card.querySelector(".poster-image").classList.add("image-missing");
				}, { once: true });
			});

			posterFilters.forEach((button) => {
				button.addEventListener("click", () => {
					const filter = button.dataset.filter;
					posterFilters.forEach((filterButton) => {
						filterButton.setAttribute("aria-pressed", String(filterButton === button));
					});
					posterCards.forEach((card) => {
						card.hidden = filter !== "all" && card.dataset.kind !== filter;
					if (!card.hidden) {
						card.style.animation = "none";
						void card.offsetWidth;
						card.style.animation = "";
					}
					});
				});
			});

			posterFilters.forEach((button) => {
				const number = posterCards.filter((card) => button.dataset.filter === "all" || card.dataset.kind === button.dataset.filter).length;
				button.querySelector(".poster-count").textContent = `(${number})`;
			});

			function loadMovies() {
				try {
					const savedMovies = JSON.parse(localStorage.getItem(storageKey) || "[]");
					return Array.isArray(savedMovies) ? savedMovies.filter((movie) => typeof movie.title === "string" && typeof movie.watched === "boolean") : [];
				} catch {
					storageUnavailable = true;
					return [];
				}
			}

			let movies = loadMovies();

			function saveMovies() {
				try {
					localStorage.setItem(storageKey, JSON.stringify(movies));
					storageUnavailable = false;
				} catch {
					storageUnavailable = true;
				}
			}

			function renderMovies() {
				watchList.replaceChildren();
				if (movies.length === 0) {
					const emptyState = document.createElement("p");
					emptyState.className = "empty-state";
					emptyState.textContent = "No films on the list yet. Got a good one in mind?";
					watchList.append(emptyState);
				} else {
					movies.forEach((movie, index) => {
						const row = document.createElement("div");
						row.className = "watch-item";
						const number = document.createElement("span");
						number.className = "watch-index";
						number.textContent = String(index + 1).padStart(2, "0");
						const title = document.createElement("span");
						title.className = `watch-title${movie.watched ? " is-watched" : ""}`;
						title.textContent = movie.title;
						const toggleButton = document.createElement("button");
						toggleButton.className = "watch-action";
						toggleButton.type = "button";
						toggleButton.textContent = movie.watched ? "Watched" : "Mark watched";
						toggleButton.setAttribute("aria-label", `${movie.watched ? "Mark unwatched" : "Mark watched"}: ${movie.title}`);
						toggleButton.addEventListener("click", () => {
							movies[index].watched = !movies[index].watched;
							saveMovies();
							renderMovies();
						});
						const removeButton = document.createElement("button");
						removeButton.className = "watch-delete";
						removeButton.type = "button";
						removeButton.textContent = "×";
						removeButton.setAttribute("aria-label", `Remove ${movie.title} from watchlist`);
						removeButton.addEventListener("click", () => {
							movies.splice(index, 1);
							saveMovies();
							renderMovies();
						});
						row.append(number, title, toggleButton, removeButton);
						watchList.append(row);
					});
				}
				const remaining = movies.filter((movie) => !movie.watched).length;
				const status = movies.length === 0 ? "Add a film and it'll be saved on this device for next time." : `${movies.length} ${movies.length === 1 ? "film" : "films"} on your list · ${remaining} still to watch`;
				count.textContent = storageUnavailable ? `${status} Your browser can't save changes between visits.` : status;
			}

			watchForm.addEventListener("submit", (event) => {
				event.preventDefault();
				const title = titleInput.value.trim();
				if (!title) return;
				movies.push({ title, watched: false });
				saveMovies();
				renderMovies();
				watchForm.reset();
				titleInput.focus();
			});

			document.querySelector("#year").textContent = String(new Date().getFullYear());

			const titles = [...document.querySelectorAll(".poster-caption h3")].map((h) => h.textContent);
			const track = document.querySelector("#marquee-track");
			const half = titles.map((t) => `<span>${t} <b>·</b></span>`).join("");
			track.innerHTML = half + half;

			renderMovies();
		})();

		const backTop = document.createElement("button");
			backTop.type = "button";
			backTop.className = "back-top";
			backTop.setAttribute("aria-label", "Back to top");
			backTop.textContent = "↑";
			document.body.append(backTop);
			addEventListener("scroll", () => backTop.classList.toggle("is-visible", scrollY > 600), { passive: true });
			backTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

		document.querySelector("#shuffle-btn").addEventListener("click", () => {
			const grid = document.querySelector("#poster-grid");
			[...grid.children].sort(() => Math.random() - 0.5).forEach((el) => grid.append(el));
		});

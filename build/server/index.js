import { Link, Links, Meta, Navigate, Outlet, Scripts, ScrollRestoration, ServerRouter, UNSAFE_withComponentProps } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ArrowDown01, ArrowLeft, Calendar, CheckCircle2, ChevronDown, Clock, CreditCard, Heart, List, Loader2, LogOut, Mail, MapPin, Pencil, PlayCircle, Plus, ShieldAlert, StopCircle, Trash2, UserRound, Users, Wine, X } from "lucide-react";
import { FaGoogle, FaInstagram } from "react-icons/fa";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, limit, orderBy, query, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import emailjs from "@emailjs/browser";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/@react-router/dev/dist/config/defaults/entry.server.web.tsx
var entry_server_web_exports = /* @__PURE__ */ __exportAll({
	default: () => handleRequest,
	streamTimeout: () => streamTimeout
});
var streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, routerContext, _loadContext) {
	if (request.method.toUpperCase() === "HEAD") return new Response(null, {
		status: responseStatusCode,
		headers: responseHeaders
	});
	let shellRendered = false;
	let userAgent = request.headers.get("user-agent");
	const body = await renderToReadableStream(/* @__PURE__ */ jsx(ServerRouter, {
		context: routerContext,
		url: request.url
	}), {
		signal: AbortSignal.timeout(6e3),
		onError(error) {
			responseStatusCode = 500;
			if (shellRendered) console.error(error);
		}
	});
	shellRendered = true;
	if (userAgent && isbot(userAgent) || routerContext.isSpaMode) await body.allReady;
	responseHeaders.set("Content-Type", "text/html");
	return new Response(body, {
		headers: responseHeaders,
		status: responseStatusCode
	});
}
//#endregion
//#region src/app/root.tsx
var root_exports = /* @__PURE__ */ __exportAll({
	Layout: () => Layout,
	default: () => root_default,
	meta: () => meta
});
var meta = () => {
	return [
		{ title: "Na prvi pogled 💞 | Speed Dating Zagreb" },
		{
			name: "description",
			content: "Na prvi pogled - Ekskluzivni speed dating eventi u Zagrebu. Upoznaj nove ljude, stvori stvarna poznanstva i doživi nezaboravno iskustvo u opuštenoj atmosferi. Prijavi se na sljedeći događaj!"
		},
		{
			name: "keywords",
			content: "speed dating zagreb, upoznavanje zagreb, izlasci, na prvi pogled, traženje partnera, druženje, mladi, event zagreb, zabava"
		},
		{
			name: "author",
			content: "Na prvi pogled"
		},
		{
			name: "robots",
			content: "index, follow"
		},
		{
			name: "language",
			content: "Croatian"
		},
		{
			name: "theme-color",
			content: "#E85D75"
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			property: "og:url",
			content: "https://naprvipogled.com/"
		},
		{
			property: "og:title",
			content: "Na prvi pogled 💞 | Speed Dating Zagreb"
		},
		{
			property: "og:description",
			content: "Ekskluzivni speed dating eventi u Zagrebu. Upoznaj nove ljude, stvori stvarna poznanstva i doživi nezaboravno iskustvo. Prijavi se!"
		},
		{
			property: "og:image",
			content: "/apple-touch-icon.png"
		},
		{
			property: "og:site_name",
			content: "Na prvi pogled"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		},
		{
			name: "twitter:url",
			content: "https://naprvipogled.com/"
		},
		{
			name: "twitter:title",
			content: "Na prvi pogled 💞 | Speed Dating Zagreb"
		},
		{
			name: "twitter:description",
			content: "Ekskluzivni speed dating eventi u Zagrebu. Upoznaj nove ljude, stvori stvarna poznanstva i doživi nezaboravno iskustvo. Prijavi se!"
		},
		{
			name: "twitter:image",
			content: "/apple-touch-icon.png"
		},
		{
			name: "apple-mobile-web-app-title",
			content: "Na prvi pogled"
		}
	];
};
function Layout({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "hr",
		children: [/* @__PURE__ */ jsxs("head", { children: [
			/* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
			/* @__PURE__ */ jsx("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "icon",
				type: "image/png",
				href: "/favicon-96x96.png",
				sizes: "96x96"
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "shortcut icon",
				href: "/favicon.ico"
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png"
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "manifest",
				href: "/site.webmanifest"
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ jsx("link", {
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
				rel: "stylesheet"
			}),
			/* @__PURE__ */ jsx(Meta, {}),
			/* @__PURE__ */ jsx(Links, {})
		] }), /* @__PURE__ */ jsxs("body", { children: [
			children,
			/* @__PURE__ */ jsx(ScrollRestoration, {}),
			/* @__PURE__ */ jsx(Scripts, {})
		] })]
	});
}
var root_default = UNSAFE_withComponentProps(function App() {
	return /* @__PURE__ */ jsx(Outlet, {});
});
//#endregion
//#region src/firebase.ts
var app = initializeApp({
	apiKey: "AIzaSyBsY249cTK2UK6ETafo5TI-aTc62L9_8IA",
	authDomain: "na-prvi-pogled.firebaseapp.com",
	projectId: "na-prvi-pogled",
	storageBucket: "na-prvi-pogled.firebasestorage.app",
	messagingSenderId: "435779332050",
	appId: "1:435779332050:web:47dcbd8281dc28ed15ca0b"
});
var db = getFirestore(app);
var auth = getAuth(app);
var provider = new GoogleAuthProvider();
//#endregion
//#region src/pages/Home.tsx
var Home_exports = /* @__PURE__ */ __exportAll({ default: () => Home_default });
var ADMIN_UIDS$1 = [
	"iKe7lzl7Msf7hd3kWyHC1ysyS3C3",
	"Izt37mNGtpY82AKZTbyYsnctoxJ2",
	"JRms1cPi2Bc513TOW0WBEFZMzrC3"
];
var Home_default = UNSAFE_withComponentProps(function Home() {
	const [user, setUser] = useState(null);
	const [activeEvent, setActiveEvent] = useState(null);
	const [loadingEvent, setLoadingEvent] = useState(true);
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
		});
		return () => unsubscribe();
	}, []);
	useEffect(() => {
		const fetchActiveEvent = async () => {
			try {
				const q = query(collection(db, "events"), where("isActive", "==", true), limit(1));
				const snapshot = await getDocs(q);
				if (!snapshot.empty) {
					const docData = snapshot.docs[0];
					setActiveEvent({
						id: docData.id,
						...docData.data()
					});
				} else setActiveEvent(null);
			} catch (err) {
				console.error("Greška pri dohvaćanju aktivnog događaja:", err);
			} finally {
				setLoadingEvent(false);
			}
		};
		fetchActiveEvent();
	}, []);
	const handleGoogleLogin = async () => {
		try {
			await signInWithPopup(auth, provider);
		} catch (err) {
			console.error("Greška pri prijavi: ", err);
		}
	};
	const handleLogout = async () => {
		try {
			await auth.signOut();
		} catch (err) {
			console.error("Greška pri odjavi: ", err);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "absolute top-6 right-6 z-20 flex items-center gap-4",
				children: user ? /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-sm",
					children: [
						ADMIN_UIDS$1.includes(user.uid) && /* @__PURE__ */ jsxs(Link, {
							to: "/admin",
							className: "text-brand flex items-center gap-1 text-xs font-bold uppercase tracking-wider mr-2 hover:text-brand-light transition-colors",
							children: [/* @__PURE__ */ jsx(ShieldAlert, { size: 14 }), " Admin"]
						}),
						user.photoURL ? /* @__PURE__ */ jsx("img", {
							src: user.photoURL,
							alt: "Profile",
							referrerPolicy: "no-referrer",
							className: "w-6 h-6 rounded-full border border-brand/20"
						}) : /* @__PURE__ */ jsx("div", {
							className: "w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand text-xs",
							children: user.email?.charAt(0).toUpperCase()
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: handleLogout,
							className: "text-brand/60 hover:text-red-500 transition-colors",
							title: "Odjavi se",
							children: /* @__PURE__ */ jsx(LogOut, { size: 16 })
						})
					]
				}) : /* @__PURE__ */ jsxs("button", {
					onClick: handleGoogleLogin,
					className: "flex items-center gap-2 bg-white/50 backdrop-blur-md hover:bg-white/80 px-4 py-2 rounded-full border border-white/60 shadow-sm text-brand text-sm font-medium transition-all",
					title: "Prijava (Google)",
					children: [/* @__PURE__ */ jsx(FaGoogle, { size: 14 }), " Prijavi se"]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "absolute top-10 left-10 text-brand-light/20 rotate-[-15deg]",
				children: /* @__PURE__ */ jsx(Heart, {
					size: 120,
					strokeWidth: 1
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "absolute bottom-10 right-10 text-brand-light/20 rotate-[15deg]",
				children: /* @__PURE__ */ jsx(Wine, {
					size: 140,
					strokeWidth: 1
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "max-w-3xl w-full bg-white/40 backdrop-blur-md p-8 sm:p-12 rounded-3xl shadow-xl border border-white/50 z-10 relative mt-12 sm:mt-0",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "text-center mb-10",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "flex justify-center mb-4 text-brand",
							children: /* @__PURE__ */ jsx(Heart, {
								size: 48,
								strokeWidth: 1.5,
								className: "fill-brand/10"
							})
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm uppercase tracking-widest text-brand-light mb-2 font-medium",
							children: "Upoznaj nekoga. Kao nekad."
						}),
						/* @__PURE__ */ jsxs("h1", {
							className: "text-5xl sm:text-7xl font-bold mb-6 tracking-tight uppercase",
							children: [
								"Na prvi",
								/* @__PURE__ */ jsx("br", {}),
								"pogled"
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "inline-block border-y border-brand py-3 px-6 mb-8",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "text-2xl font-bold uppercase tracking-wider text-brand-light",
								children: "Manje Ekrana"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-serif italic text-xl",
								children: "Više stvarnih susreta"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-lg space-y-4 font-light text-brand/80 max-w-2xl mx-auto mb-8",
							children: [
								/* @__PURE__ */ jsx("p", { children: "Koliko puta si pomislio/la da bi nekoga volio/la upoznati, ali nikad nisi napravio/la prvi korak?" }),
								/* @__PURE__ */ jsxs("p", {
									className: "font-medium",
									children: [/* @__PURE__ */ jsx("strong", { children: "Na prvi pogled" }), " je večer stvorena za nove susrete. Druženje, opuštena atmosfera i prilika da nekoga upoznaš onako kako se nekad upoznavalo - uživo."]
								}),
								/* @__PURE__ */ jsx("p", { children: "Ti napravi prvi korak. Za sve ostalo pobrinut ćemo se mi." })
							]
						})
					]
				}), loadingEvent ? /* @__PURE__ */ jsx("div", {
					className: "flex justify-center items-center py-12 text-brand/50",
					children: /* @__PURE__ */ jsx(Loader2, {
						className: "animate-spin",
						size: 32
					})
				}) : activeEvent ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 bg-white/50 p-6 rounded-2xl border border-white/60",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "col-span-1 sm:col-span-2 text-center mb-2 pb-4 border-b border-white/60",
							children: /* @__PURE__ */ jsx("h3", {
								className: "font-bold text-xl text-brand",
								children: activeEvent.title
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "bg-brand/10 p-2 rounded-full text-brand",
								children: /* @__PURE__ */ jsx(Users, { size: 20 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs uppercase tracking-wider text-brand/60 font-semibold",
								children: "Dobna skupina"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: activeEvent.ageGroup
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "bg-brand/10 p-2 rounded-full text-brand",
								children: /* @__PURE__ */ jsx(Calendar, { size: 20 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs uppercase tracking-wider text-brand/60 font-semibold",
								children: "Datum"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: activeEvent.dateStr
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "bg-brand/10 p-2 rounded-full text-brand",
								children: /* @__PURE__ */ jsx(Clock, { size: 20 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs uppercase tracking-wider text-brand/60 font-semibold",
								children: "Vrijeme"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: activeEvent.timeStr
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "bg-brand/10 p-2 rounded-full text-brand",
								children: /* @__PURE__ */ jsx(MapPin, { size: 20 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs uppercase tracking-wider text-brand/60 font-semibold",
								children: "Lokacija"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: activeEvent.location
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "bg-brand/10 p-2 rounded-full text-brand",
								children: /* @__PURE__ */ jsx(CreditCard, { size: 20 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs uppercase tracking-wider text-brand/60 font-semibold",
								children: "Kotizacija"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: activeEvent.price
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-2 justify-center",
							children: [/* @__PURE__ */ jsxs("a", {
								href: "https://instagram.com/na.prvi.pogled",
								target: "_blank",
								rel: "noreferrer",
								className: "flex items-center gap-2 text-sm font-medium hover:text-brand-light transition-colors w-fit",
								children: [/* @__PURE__ */ jsx(FaInstagram, { size: 16 }), " @na.prvi.pogled"]
							}), /* @__PURE__ */ jsxs("a", {
								href: "mailto:naprvipogled.events@gmail.com",
								className: "flex items-center gap-2 text-sm font-medium hover:text-brand-light transition-colors w-fit",
								children: [/* @__PURE__ */ jsx(Mail, { size: 16 }), " naprvipogled.events@gmail.com"]
							})]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "text-center",
					children: [/* @__PURE__ */ jsxs(Link, {
						to: `/prijava?eventId=${activeEvent.id}`,
						className: "inline-flex items-center gap-2 bg-brand hover:bg-brand-light text-white px-10 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-brand/30",
						children: ["Prijavi se ", /* @__PURE__ */ jsx(Heart, {
							size: 18,
							className: "fill-white"
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-4 text-xs font-medium uppercase tracking-widest text-brand-light",
						children: "Broj mjesta je ograničen"
					})]
				})] }) : /* @__PURE__ */ jsxs("div", {
					className: "bg-white/50 p-8 rounded-2xl border border-white/60 text-center mb-6",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "bg-brand/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-brand",
							children: /* @__PURE__ */ jsx(Clock, { size: 32 })
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "text-2xl font-serif font-bold text-brand mb-2",
							children: "Trenutno nema aktivnih prijava"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-brand/80",
							children: "Sva mjesta za trenutni događaj su popunjena ili još nismo najavili novi susret."
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-brand/80 mt-2 font-medium",
							children: [
								"Pratite naš ",
								/* @__PURE__ */ jsx("a", {
									href: "https://instagram.com/na.prvi.pogled",
									target: "_blank",
									rel: "noreferrer",
									className: "underline hover:text-brand",
									children: "Instagram profil"
								}),
								" za najave!"
							]
						})
					]
				})]
			})
		]
	});
});
//#endregion
//#region src/pages/FormPage.tsx
var FormPage_exports = /* @__PURE__ */ __exportAll({ default: () => FormPage_default });
var FormPage_default = UNSAFE_withComponentProps(function FormPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [user, setUser] = useState(null);
	const [authLoading, setAuthLoading] = useState(true);
	const [activeEvent, setActiveEvent] = useState(null);
	const [eventLoading, setEventLoading] = useState(true);
	const [isEventFull, setIsEventFull] = useState(false);
	const [formData, setFormData] = useState({
		imePrezime: "",
		spol: "",
		email: "",
		godine: "",
		napomena: ""
	});
	const [customAnswers, setCustomAnswers] = useState({});
	const [existingRegistration, setExistingRegistration] = useState(null);
	const [checkRegistrationLoading, setCheckRegistrationLoading] = useState(false);
	useEffect(() => {
		const checkRegistration = async () => {
			if (user && activeEvent) {
				setCheckRegistrationLoading(true);
				try {
					const q = query(collection(db, "prijave"), where("eventId", "==", activeEvent.id), where("uid", "==", user.uid), limit(1));
					const snap = await getDocs(q);
					if (!snap.empty) setExistingRegistration(snap.docs[0].data());
					else setExistingRegistration(null);
				} catch (err) {
					console.error("Greška pri provjeri prijave:", err);
				} finally {
					setCheckRegistrationLoading(false);
				}
			}
		};
		checkRegistration();
	}, [user, activeEvent]);
	const handleCustomChange = (fieldId, value) => {
		setCustomAnswers((prev) => ({
			...prev,
			[fieldId]: value
		}));
	};
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			if (currentUser) setFormData((prev) => ({
				...prev,
				email: currentUser.email || "",
				imePrezime: currentUser.displayName || prev.imePrezime
			}));
			setAuthLoading(false);
		});
		return () => unsubscribe();
	}, []);
	useEffect(() => {
		const fetchActiveEvent = async () => {
			try {
				const q = query(collection(db, "events"), where("isActive", "==", true), limit(1));
				const snapshot = await getDocs(q);
				if (!snapshot.empty) {
					const docData = snapshot.docs[0];
					const data = docData.data();
					let isFull = false;
					if (data.maxRegistrations && Number(data.maxRegistrations) > 0) {
						const prijaveQ = query(collection(db, "prijave"), where("eventId", "==", docData.id));
						if ((await getDocs(prijaveQ)).docs.filter((doc) => doc.data().status !== "rejected").length >= Number(data.maxRegistrations)) isFull = true;
					}
					if (isFull) {
						setIsEventFull(true);
						setActiveEvent(null);
					} else setActiveEvent({
						id: docData.id,
						title: data.title,
						customFields: data.customFields || [],
						maxRegistrations: data.maxRegistrations,
						introText: data.introText || "",
						noteText: data.noteText || "",
						closingText: data.closingText || "",
						timeNote: data.timeNote || "",
						dateStr: data.dateStr || "",
						timeStr: data.timeStr || "",
						location: data.location || "",
						ageGroup: data.ageGroup || "",
						price: data.price || ""
					});
				} else setActiveEvent(null);
			} catch (err) {
				console.error("Greška pri dohvaćanju događaja:", err);
			} finally {
				setEventLoading(false);
			}
		};
		fetchActiveEvent();
	}, []);
	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};
	const handleGoogleLogin = async () => {
		setError("");
		try {
			await signInWithPopup(auth, provider);
		} catch (err) {
			console.error("Greška pri prijavi: ", err);
			setError("Došlo je do greške pri prijavi s Google računom.");
		}
	};
	const handleLogout = async () => {
		try {
			await auth.signOut();
		} catch (err) {
			console.error("Greška pri odjavi: ", err);
		}
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!user) {
			setError("Morate biti prijavljeni da biste se prijavili.");
			return;
		}
		if (!activeEvent) {
			setError("Prijave su trenutno zatvorene.");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const customAnswersArray = (activeEvent.customFields || []).filter((field) => customAnswers[field.id] !== void 0 && customAnswers[field.id] !== "" && (!Array.isArray(customAnswers[field.id]) || customAnswers[field.id].length > 0)).map((field) => ({
				label: field.label,
				value: customAnswers[field.id]
			}));
			if (activeEvent.maxRegistrations && Number(activeEvent.maxRegistrations) > 0) {
				const prijaveQ = query(collection(db, "prijave"), where("eventId", "==", activeEvent.id));
				if ((await getDocs(prijaveQ)).docs.filter((doc) => doc.data().status !== "rejected").length >= Number(activeEvent.maxRegistrations)) {
					setError("Nažalost, u međuvremenu su se popunila sva mjesta.");
					setLoading(false);
					setIsEventFull(true);
					setActiveEvent(null);
					return;
				}
			}
			await addDoc(collection(db, "prijave"), {
				...formData,
				godine: Number(formData.godine),
				uid: user.uid,
				eventId: activeEvent.id,
				customAnswers: customAnswersArray,
				status: "pending",
				createdAt: serverTimestamp()
			});
			setExistingRegistration({
				status: "pending",
				...formData
			});
		} catch (err) {
			console.error("Error adding document: ", err);
			setError("Došlo je do greške prilikom prijave. Pokušajte ponovno.");
		} finally {
			setLoading(false);
		}
	};
	if (authLoading || eventLoading) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-peach text-brand flex items-center justify-center font-sans",
		children: /* @__PURE__ */ jsx(Loader2, {
			size: 32,
			className: "animate-spin text-brand/50"
		})
	});
	if (!activeEvent) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen flex items-center justify-center p-6 bg-peach text-brand font-sans",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-white",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "text-2xl font-serif font-bold mb-4",
					children: isEventFull ? "Prijave su popunjene" : "Prijave su zatvorene"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-brand/80 mb-8 font-light",
					children: isEventFull ? "Nažalost, sva mjesta za ovaj događaj su popunjena." : "Trenutno nema aktivnih događaja za koje se moguće prijaviti."
				}),
				/* @__PURE__ */ jsxs(Link, {
					to: "/",
					className: "inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-light transition-colors",
					children: [/* @__PURE__ */ jsx(ArrowLeft, { size: 18 }), " Povratak na naslovnicu"]
				})
			]
		})
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen py-12 px-6 sm:px-12 flex justify-center bg-peach text-brand relative overflow-x-hidden",
		children: [/* @__PURE__ */ jsx("div", {
			className: "absolute top-20 right-[-20px] text-brand-light/10 rotate-[25deg] pointer-events-none",
			children: /* @__PURE__ */ jsx(Heart, {
				size: 200,
				strokeWidth: 1
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "max-w-xl w-full z-10",
			children: [/* @__PURE__ */ jsxs(Link, {
				to: "/",
				className: "inline-flex items-center gap-2 text-brand/70 hover:text-brand mb-8 transition-colors font-medium",
				children: [/* @__PURE__ */ jsx(ArrowLeft, { size: 18 }), " Natrag"]
			}), /* @__PURE__ */ jsxs("div", {
				className: "bg-white/40 backdrop-blur-md p-8 sm:p-12 rounded-3xl shadow-xl border border-white/50",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "text-center mb-6",
						children: [/* @__PURE__ */ jsx("span", {
							className: "bg-brand/10 text-brand text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block",
							children: activeEvent.title
						}), !existingRegistration && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h1", {
							className: "text-4xl font-serif font-bold mb-3 uppercase tracking-tight mt-2",
							children: "Prijava"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-brand/80 font-light",
							children: [
								!user ? "Prijava je zaštićena. Molimo potvrdite svoj identitet kako bi pristupili formi." : "Ispuni podatke ispod. Sva polja s ",
								user && /* @__PURE__ */ jsx("span", {
									className: "text-red-500",
									children: "*"
								}),
								user && " su obavezna."
							]
						})] })]
					}),
					error && /* @__PURE__ */ jsx("div", {
						className: "bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm",
						children: error
					}),
					!user ? /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center py-6",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "bg-white p-4 rounded-full shadow-md mb-6 text-brand",
								children: /* @__PURE__ */ jsx(FaGoogle, { size: 32 })
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: handleGoogleLogin,
								className: "w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] border border-gray-200 flex justify-center items-center gap-3",
								children: [/* @__PURE__ */ jsx(FaGoogle, {
									size: 20,
									className: "text-blue-600"
								}), "Prijavi se s Googleom"]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-center text-xs text-brand/60 mt-6",
								children: "Koristimo Google prijavu isključivo za sprječavanje spama i automatiziranih prijava."
							})
						]
					}) : checkRegistrationLoading ? /* @__PURE__ */ jsx("div", {
						className: "flex justify-center items-center py-12 text-brand/50",
						children: /* @__PURE__ */ jsx(Loader2, {
							className: "animate-spin",
							size: 32
						})
					}) : existingRegistration ? /* @__PURE__ */ jsxs("div", {
						className: "text-center py-8",
						children: [
							(!existingRegistration.status || existingRegistration.status === "accepted") && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(CheckCircle2, {
									size: 48,
									className: "mx-auto text-green-500 mb-4"
								}),
								/* @__PURE__ */ jsx("h2", {
									className: "text-2xl font-serif font-bold mb-2",
									children: "Prijava prihvaćena!"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-brand/80 mb-8 font-light",
									children: "Tvoja prijava za ovaj događaj je uspješno prihvaćena i osigurano ti je mjesto. Vidimo se!"
								})
							] }),
							existingRegistration.status === "pending" && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(Loader2, {
									size: 48,
									className: "mx-auto text-yellow-500 mb-4 animate-spin-slow"
								}),
								/* @__PURE__ */ jsx("h2", {
									className: "text-2xl font-serif font-bold mb-2",
									children: "Prijava je poslana"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-brand/80 mb-8 font-light",
									children: "Tvoja prijava je uspješno zaprimljena i trenutačno čeka na pregled organizatora. Javit ćemo ti se povratno na email!"
								})
							] }),
							existingRegistration.status === "rejected" && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx("div", {
									className: "w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4",
									children: /* @__PURE__ */ jsx("div", {
										className: "text-red-500 text-2xl font-bold",
										children: "X"
									})
								}),
								/* @__PURE__ */ jsx("h2", {
									className: "text-2xl font-serif font-bold mb-2 text-red-600",
									children: "Prijava odbijena"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-brand/80 mb-8 font-light",
									children: "Nažalost, nismo u mogućnosti potvrditi tvoju prijavu za ovaj događaj. Hvala ti na interesu!"
								})
							] }),
							/* @__PURE__ */ jsxs(Link, {
								to: "/",
								className: "inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-light transition-colors",
								children: [/* @__PURE__ */ jsx(ArrowLeft, { size: 18 }), " Povratak na naslovnicu"]
							})
						]
					}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-8 pb-4 border-b border-brand/10",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [user.photoURL ? /* @__PURE__ */ jsx("img", {
								src: user.photoURL,
								alt: "Profile",
								referrerPolicy: "no-referrer",
								className: "w-10 h-10 rounded-full border border-brand/20"
							}) : /* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand",
								children: user.email?.charAt(0).toUpperCase()
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-sm",
								children: [/* @__PURE__ */ jsx("p", {
									className: "font-semibold",
									children: user.displayName || "Korisnik"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-brand/60 text-xs",
									children: user.email
								})]
							})]
						}), /* @__PURE__ */ jsx("button", {
							onClick: handleLogout,
							className: "p-2 text-brand/60 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors",
							title: "Odjavi se",
							children: /* @__PURE__ */ jsx(LogOut, { size: 18 })
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: handleSubmit,
						className: "space-y-6",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								htmlFor: "imePrezime",
								className: "block text-sm font-semibold text-brand mb-2",
								children: "Ime i prezime *"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								id: "imePrezime",
								name: "imePrezime",
								required: true,
								value: formData.imePrezime,
								onChange: handleChange,
								className: "w-full px-4 py-3 rounded-xl bg-white/60 border border-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all",
								placeholder: "Unesite ime i prezime"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-sm font-semibold text-brand mb-3",
								children: "Spol *"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex gap-6",
								children: [/* @__PURE__ */ jsxs("label", {
									className: "flex items-center gap-2 cursor-pointer group",
									children: [/* @__PURE__ */ jsx("input", {
										type: "radio",
										name: "spol",
										value: "M",
										required: true,
										checked: formData.spol === "M",
										onChange: handleChange,
										className: "w-5 h-5 text-brand bg-white/60 border-brand focus:ring-brand accent-brand cursor-pointer"
									}), /* @__PURE__ */ jsx("span", {
										className: "group-hover:text-brand-light transition-colors",
										children: "M"
									})]
								}), /* @__PURE__ */ jsxs("label", {
									className: "flex items-center gap-2 cursor-pointer group",
									children: [/* @__PURE__ */ jsx("input", {
										type: "radio",
										name: "spol",
										value: "Ž",
										required: true,
										checked: formData.spol === "Ž",
										onChange: handleChange,
										className: "w-5 h-5 text-brand bg-white/60 border-brand focus:ring-brand accent-brand cursor-pointer"
									}), /* @__PURE__ */ jsx("span", {
										className: "group-hover:text-brand-light transition-colors",
										children: "Ž"
									})]
								})]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("label", {
									htmlFor: "email",
									className: "block text-sm font-semibold text-brand mb-2",
									children: "E-mail adresa *"
								}),
								/* @__PURE__ */ jsx("input", {
									type: "email",
									id: "email",
									name: "email",
									required: true,
									readOnly: true,
									value: formData.email,
									className: "w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-500 cursor-not-allowed outline-none"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-brand/60 mt-1",
									children: "E-mail je automatski preuzet s vašeg Google računa."
								})
							] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								htmlFor: "godine",
								className: "block text-sm font-semibold text-brand mb-2",
								children: "Koliko imaš godina? *"
							}), /* @__PURE__ */ jsx("input", {
								type: "number",
								id: "godine",
								name: "godine",
								min: "18",
								max: "99",
								required: true,
								value: formData.godine,
								onChange: handleChange,
								className: "w-full px-4 py-3 rounded-xl bg-white/60 border border-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all",
								placeholder: "Npr. 21"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								htmlFor: "napomena",
								className: "block text-sm font-semibold text-brand mb-2",
								children: "Napomena (ako ju imaš)"
							}), /* @__PURE__ */ jsx("textarea", {
								id: "napomena",
								name: "napomena",
								rows: 3,
								value: formData.napomena,
								onChange: handleChange,
								className: "w-full px-4 py-3 rounded-xl bg-white/60 border border-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none",
								placeholder: "Imaš li neku napomenu za nas?"
							})] }),
							activeEvent.customFields && activeEvent.customFields.length > 0 && /* @__PURE__ */ jsxs("div", {
								className: "pt-4 border-t border-brand/10 space-y-6",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "font-serif font-bold text-lg text-brand mb-4",
									children: "Dodatna pitanja"
								}), activeEvent.customFields.map((field) => /* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsxs("label", {
										htmlFor: field.id,
										className: "block text-sm font-semibold text-brand mb-2",
										children: [
											field.label,
											" ",
											field.required && "*"
										]
									}),
									field.type === "text" && /* @__PURE__ */ jsx("input", {
										type: "text",
										id: field.id,
										required: field.required,
										value: customAnswers[field.id] || "",
										onChange: (e) => handleCustomChange(field.id, e.target.value),
										className: "w-full px-4 py-3 rounded-xl bg-white/60 border border-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
									}),
									field.type === "textarea" && /* @__PURE__ */ jsx("textarea", {
										id: field.id,
										rows: 3,
										required: field.required,
										value: customAnswers[field.id] || "",
										onChange: (e) => handleCustomChange(field.id, e.target.value),
										className: "w-full px-4 py-3 rounded-xl bg-white/60 border border-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none"
									}),
									field.type === "select" && /* @__PURE__ */ jsx("div", {
										className: "space-y-2",
										children: field.options?.map((option, idx) => /* @__PURE__ */ jsxs("label", {
											className: "flex items-center gap-2 cursor-pointer group",
											children: [/* @__PURE__ */ jsx("input", {
												type: "radio",
												name: field.id,
												value: option,
												required: field.required,
												checked: customAnswers[field.id] === option,
												onChange: (e) => handleCustomChange(field.id, e.target.value),
												className: "w-5 h-5 text-brand bg-white/60 border-brand focus:ring-brand accent-brand cursor-pointer"
											}), /* @__PURE__ */ jsx("span", {
												className: "group-hover:text-brand-light transition-colors",
												children: option
											})]
										}, idx))
									}),
									field.type === "multiselect" && /* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [field.options?.map((option, idx) => {
											const currentValues = customAnswers[field.id] || [];
											return /* @__PURE__ */ jsxs("label", {
												className: "flex items-center gap-2 cursor-pointer group",
												children: [/* @__PURE__ */ jsx("input", {
													type: "checkbox",
													name: `${field.id}_${idx}`,
													value: option,
													checked: currentValues.includes(option),
													onChange: (e) => {
														let newValues = [...currentValues];
														if (e.target.checked) newValues.push(option);
														else newValues = newValues.filter((v) => v !== option);
														handleCustomChange(field.id, newValues);
													},
													className: "w-5 h-5 text-brand bg-white/60 border-brand focus:ring-brand accent-brand cursor-pointer rounded"
												}), /* @__PURE__ */ jsx("span", {
													className: "group-hover:text-brand-light transition-colors",
													children: option
												})]
											}, idx);
										}), field.required && (customAnswers[field.id]?.length || 0) === 0 && /* @__PURE__ */ jsx("input", {
											type: "checkbox",
											required: true,
											className: "opacity-0 absolute w-0 h-0"
										})]
									})
								] }, field.id))]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "submit",
								disabled: loading,
								className: "w-full bg-brand hover:bg-brand-light text-white font-semibold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center gap-2",
								children: [loading ? "Slanje..." : "Prijavi se", !loading && /* @__PURE__ */ jsx(Heart, {
									size: 18,
									className: "fill-white"
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-center text-xs text-brand/60 mt-4",
								children: "Pritiskom na gumb potvrđuješ prijavu. Podaci se koriste isključivo u svrhu organizacije eventa."
							})
						]
					})] })
				]
			})]
		})]
	});
});
//#endregion
//#region src/pages/AdminDashboard.tsx
var AdminDashboard_exports = /* @__PURE__ */ __exportAll({ default: () => AdminDashboard_default });
var ADMIN_UIDS = [
	"iKe7lzl7Msf7hd3kWyHC1ysyS3C3",
	"Izt37mNGtpY82AKZTbyYsnctoxJ2",
	"JRms1cPi2Bc513TOW0WBEFZMzrC3"
];
var AdminDashboard_default = UNSAFE_withComponentProps(function AdminDashboard() {
	const [user, setUser] = useState(null);
	const [authLoading, setAuthLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("prijave");
	const [events, setEvents] = useState([]);
	const [prijave, setPrijave] = useState([]);
	const [selectedEventId, setSelectedEventId] = useState("");
	const [dataLoading, setDataLoading] = useState(false);
	const [eventsLoading, setEventsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showNewEventForm, setShowNewEventForm] = useState(false);
	const [editingEventId, setEditingEventId] = useState(null);
	const [newEvent, setNewEvent] = useState({
		title: "",
		ageGroup: "",
		dateStr: "",
		timeStr: "",
		location: "",
		price: "",
		maxRegistrations: "",
		introText: "Hvala ti što si nam ukazao/la povjerenje i odlučio/la biti dio prvog \"Na prvi pogled\" speed dating eventa!",
		noteText: "Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.",
		closingText: "Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.",
		timeNote: "Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije."
	});
	const [newCustomFields, setNewCustomFields] = useState([]);
	const [openFieldDropdownIndex, setOpenFieldDropdownIndex] = useState(null);
	const [selectedPrijava, setSelectedPrijava] = useState(null);
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState("Nažalost, zbog ograničenog broja mjesta i velikog interesa, ovaj put ti nismo u mogućnosti potvrditi sudjelovanje. Mjesta su se popunila vrlo brzo ili pokušavamo balansirati omjer sudionika.");
	const [rejectDropdownOpen, setRejectDropdownOpen] = useState(false);
	const REJECT_REASONS = [
		{
			id: "full",
			label: "Popunjena mjesta",
			text: "Nažalost, zbog ograničenog broja mjesta i velikog interesa, ovaj put ti nismo u mogućnosti potvrditi sudjelovanje. Mjesta su se popunila vrlo brzo ili pokušavamo balansirati omjer sudionika."
		},
		{
			id: "age",
			label: "Dobna skupina",
			text: "Nažalost, za ovaj događaj prednost smo morali dati prijavama koje se točno uklapaju u predviđenu dobnu skupinu kako bismo osigurali najbolje iskustvo za sve sudionike."
		},
		{
			id: "other",
			label: "Općenito",
			text: "Nažalost, ovaj put ti nismo u mogućnosti potvrditi sudjelovanje."
		}
	];
	const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setAuthLoading(false);
		});
		return () => unsubscribe();
	}, []);
	useEffect(() => {
		if (user && ADMIN_UIDS.includes(user.uid)) fetchEvents();
	}, [user]);
	useEffect(() => {
		if (user && ADMIN_UIDS.includes(user.uid)) fetchPrijave(selectedEventId);
	}, [selectedEventId, user]);
	const fetchEvents = async () => {
		setEventsLoading(true);
		try {
			const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
			const data = (await getDocs(q)).docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));
			setEvents(data);
			if (!selectedEventId && data.length > 0) {
				const active = data.find((e) => e.isActive);
				setSelectedEventId(active ? active.id : data[0].id);
			}
		} catch (err) {
			console.error("Error fetching events:", err);
			setError("Greška pri dohvaćanju događaja.");
		} finally {
			setEventsLoading(false);
		}
	};
	const fetchPrijave = async (eventId) => {
		setDataLoading(true);
		setError("");
		try {
			let q;
			if (eventId) q = query(collection(db, "prijave"), where("eventId", "==", eventId), orderBy("createdAt", "desc"));
			else q = query(collection(db, "prijave"), orderBy("createdAt", "desc"));
			const data = (await getDocs(q)).docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));
			setPrijave(data);
		} catch (err) {
			console.error("Error fetching prijave:", err);
			setError("Greška pri dohvaćanju prijava. (Možda je potrebno kreirati Firestore indeks)");
		} finally {
			setDataLoading(false);
		}
	};
	const openEditEvent = (eventToEdit) => {
		setEditingEventId(eventToEdit.id);
		setNewEvent({
			title: eventToEdit.title,
			ageGroup: eventToEdit.ageGroup,
			dateStr: eventToEdit.dateStr,
			timeStr: eventToEdit.timeStr,
			location: eventToEdit.location,
			price: eventToEdit.price,
			maxRegistrations: eventToEdit.maxRegistrations ? String(eventToEdit.maxRegistrations) : "",
			introText: eventToEdit.introText || "Hvala ti što si nam ukazao/la povjerenje i odlučio/la biti dio prvog \"Na prvi pogled\" speed dating eventa!",
			noteText: eventToEdit.noteText || "Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.",
			closingText: eventToEdit.closingText || "Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.",
			timeNote: eventToEdit.timeNote || "Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije."
		});
		setNewCustomFields(eventToEdit.customFields?.map((f) => ({
			...f,
			rawOptions: f.options?.join(", ") || ""
		})) || []);
		setShowNewEventForm(true);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const handleCancelEdit = () => {
		setShowNewEventForm(false);
		setEditingEventId(null);
		setNewEvent({
			title: "",
			ageGroup: "",
			dateStr: "",
			timeStr: "",
			location: "",
			price: "",
			maxRegistrations: "",
			introText: "Hvala ti što si nam ukazao/la povjerenje i odlučio/la biti dio prvog \"Na prvi pogled\" speed dating eventa!",
			noteText: "Napomena: Ako ti se ipak dogodi da iz nekog razloga ne možeš doći, molimo te da nam to javiš najkasnije do 14. rujna, kako bismo tvoje mjesto mogli ponuditi nekome drugome.",
			closingText: "Kotizaciju od 10 € plaćaš prilikom evidencije sudionika prije početka događaja.\n\nProgram završavamo oko 22:00, a nakon toga ostavljamo vrijeme za neformalno druženje.",
			timeNote: "Molimo te da dođeš 15 minuta ranije (18:45), radi evidencije."
		});
		setNewCustomFields([]);
		setOpenFieldDropdownIndex(null);
	};
	const handleSaveEvent = async (e) => {
		e.preventDefault();
		try {
			const mappedCustomFields = newCustomFields.map((f) => {
				const { rawOptions, ...rest } = f;
				return {
					...rest,
					options: rawOptions ? rawOptions.split(",").map((s) => s.trim()).filter(Boolean) : rest.options || []
				};
			});
			if (editingEventId) await updateDoc(doc(db, "events", editingEventId), {
				...newEvent,
				maxRegistrations: newEvent.maxRegistrations ? Number(newEvent.maxRegistrations) : null,
				customFields: mappedCustomFields
			});
			else await addDoc(collection(db, "events"), {
				...newEvent,
				maxRegistrations: newEvent.maxRegistrations ? Number(newEvent.maxRegistrations) : null,
				customFields: mappedCustomFields,
				isActive: false,
				createdAt: serverTimestamp()
			});
			handleCancelEdit();
			fetchEvents();
		} catch (err) {
			console.error("Error saving event:", err);
			setError("Greška pri spremanju događaja.");
		}
	};
	const confirmDeletePrijava = async () => {
		if (!selectedPrijava) return;
		setActionLoading(true);
		try {
			await deleteDoc(doc(db, "prijave", selectedPrijava.id));
			setSelectedPrijava(null);
			setDeleteModalOpen(false);
			fetchPrijave(selectedEventId);
		} catch (err) {
			console.error("Greška pri brisanju prijave:", err);
			alert("Dogodila se greška prilikom brisanja prijave.");
		} finally {
			setActionLoading(false);
		}
	};
	const handleAcceptPrijava = async (prijava) => {
		setActionLoading(true);
		try {
			const activeEvent = events.find((e) => e.id === prijava.eventId);
			if (!activeEvent) {
				alert("Greška: Događaj nije pronađen.");
				setActionLoading(false);
				return;
			}
			await updateDoc(doc(db, "prijave", prijava.id), { status: "accepted" });
			try {
				await emailjs.send("default_service", "template_uuvkcp3", {
					name: prijava.imePrezime.split(" ")[0],
					email: prijava.email,
					introText: activeEvent.introText || "",
					noteText: activeEvent.noteText || "",
					closingText: activeEvent.closingText || "",
					timeNote: activeEvent.timeNote || "",
					dateStr: activeEvent.dateStr || "",
					timeStr: activeEvent.timeStr || "",
					location: activeEvent.location || "",
					ageGroup: activeEvent.ageGroup || "",
					price: activeEvent.price || ""
				}, "u1xSiCheIxgLpWexO");
			} catch (emailErr) {
				console.error("Greška pri slanju emaila o prihvaćanju: ", emailErr);
				alert("Status je ažuriran, ali slanje emaila nije uspjelo.");
			}
			setSelectedPrijava({
				...prijava,
				status: "accepted"
			});
			fetchPrijave(selectedEventId);
		} catch (err) {
			console.error("Greška pri prihvaćanju:", err);
			alert("Dogodila se greška prilikom prihvaćanja prijave.");
		} finally {
			setActionLoading(false);
		}
	};
	const confirmRejectPrijava = async () => {
		if (!selectedPrijava) return;
		setActionLoading(true);
		try {
			await updateDoc(doc(db, "prijave", selectedPrijava.id), { status: "rejected" });
			const htmlMessage = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #E85D75; text-align: center; text-transform: uppercase; margin-bottom: 5px;">Na prvi pogled</h2>
          <p style="text-align: center; color: #888; font-size: 14px; margin-top: 0; margin-bottom: 25px;">Obavijest o prijavi</p>
          <p>Draga/i <strong>${selectedPrijava.imePrezime.split(" ")[0]}</strong>,</p>
          <p>Zahvaljujemo ti na interesu i poslanoj prijavi za nadolazeći <em>Na prvi pogled</em> speed dating event.</p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #ccc; padding: 15px; margin: 25px 0;">
            <p style="margin: 0;">${rejectReason}</p>
          </div>
          <p>Iskreno se nadamo da ćeš nam se pridružiti na nekom od sljedećih događaja. Prati nas i dalje za nove najave!</p>
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="color: #555; font-size: 14px; margin: 0;">Srdačan pozdrav,<br/><strong style="color: #333;">Tim Na prvi pogled</strong></p>
          </div>
        </div>
      `;
			try {
				await emailjs.send("default_service", "template_apq7zys", {
					name: selectedPrijava.imePrezime.split(" ")[0],
					email: selectedPrijava.email,
					html_message: htmlMessage
				}, "u1xSiCheIxgLpWexO");
			} catch (emailErr) {
				console.error("Greška pri slanju emaila o odbijanju: ", emailErr);
				alert("Status je ažuriran, ali slanje emaila nije uspjelo.");
			}
			setSelectedPrijava({
				...selectedPrijava,
				status: "rejected"
			});
			setRejectModalOpen(false);
			fetchPrijave(selectedEventId);
		} catch (err) {
			console.error("Greška pri odbijanju:", err);
			alert("Dogodila se greška prilikom odbijanja prijave.");
		} finally {
			setActionLoading(false);
		}
	};
	const toggleEventActive = async (eventToToggle) => {
		try {
			const batch = writeBatch(db);
			if (!eventToToggle.isActive) events.filter((e) => e.isActive).forEach((e) => {
				const eRef = doc(db, "events", e.id);
				batch.update(eRef, { isActive: false });
			});
			const targetRef = doc(db, "events", eventToToggle.id);
			batch.update(targetRef, { isActive: !eventToToggle.isActive });
			await batch.commit();
			fetchEvents();
		} catch (err) {
			console.error("Error toggling event:", err);
			setError("Greška pri promjeni statusa događaja.");
		}
	};
	if (authLoading) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-peach flex items-center justify-center",
		children: /* @__PURE__ */ jsx(Loader2, {
			className: "animate-spin text-brand",
			size: 40
		})
	});
	if (!user || !ADMIN_UIDS.includes(user.uid)) return /* @__PURE__ */ jsx(Navigate, {
		to: "/",
		replace: true
	});
	const validPrijave = prijave.filter((p) => p.status !== "rejected");
	const total = validPrijave.length;
	const femaleCount = validPrijave.filter((p) => p.spol === "Ž" || p.spol === "Z" || p.spol.toLowerCase() === "žensko").length;
	const maleCount = validPrijave.filter((p) => p.spol === "M" || p.spol.toLowerCase() === "muško").length;
	const avgAge = total > 0 ? (validPrijave.reduce((sum, p) => sum + (Number(p.godine) || 0), 0) / total).toFixed(1) : 0;
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#f8f9fa] text-gray-800 font-sans p-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "max-w-6xl mx-auto",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsxs(Link, {
								to: "/",
								className: "inline-flex items-center gap-2 text-brand/70 hover:text-brand mb-2 transition-colors font-medium",
								children: [/* @__PURE__ */ jsx(ArrowLeft, { size: 16 }), " Natrag na naslovnicu"]
							}),
							/* @__PURE__ */ jsx("h1", {
								className: "text-3xl font-serif font-bold text-brand",
								children: "Admin Panel"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-gray-500 text-sm mt-1",
								children: "Upravljanje prijavama i događajima"
							})
						] }), /* @__PURE__ */ jsxs("div", {
							className: "flex bg-white rounded-lg p-1 shadow-sm border border-gray-200",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => setActiveTab("prijave"),
								className: `px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === "prijave" ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"}`,
								children: [/* @__PURE__ */ jsx(List, { size: 16 }), " Prijave"]
							}), /* @__PURE__ */ jsxs("button", {
								onClick: () => setActiveTab("events"),
								className: `px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === "events" ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"}`,
								children: [/* @__PURE__ */ jsx(Calendar, { size: 16 }), " Događaji"]
							})]
						})]
					}),
					error && /* @__PURE__ */ jsx("div", {
						className: "bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm",
						children: error
					}),
					activeTab === "events" && /* @__PURE__ */ jsx("div", {
						className: "space-y-6",
						children: /* @__PURE__ */ jsxs("div", {
							className: "bg-white p-6 rounded-2xl shadow-sm border border-gray-100",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex justify-between items-center mb-6",
									children: [/* @__PURE__ */ jsx("h2", {
										className: "text-xl font-bold font-serif text-brand",
										children: "Događaji"
									}), /* @__PURE__ */ jsxs("button", {
										onClick: () => {
											if (showNewEventForm && !editingEventId) handleCancelEdit();
											else {
												handleCancelEdit();
												setShowNewEventForm(true);
											}
										},
										className: "bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-light transition-colors flex items-center gap-2",
										children: [/* @__PURE__ */ jsx(Plus, { size: 16 }), " Novi Događaj"]
									})]
								}),
								showNewEventForm && /* @__PURE__ */ jsxs("form", {
									onSubmit: handleSaveEvent,
									className: "bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 space-y-4 shadow-sm",
									children: [
										/* @__PURE__ */ jsx("h3", {
											className: "font-semibold text-gray-800 mb-4",
											children: editingEventId ? "Uredi događaj" : "Kreiraj novi događaj"
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-1 md:grid-cols-2 gap-4",
											children: [
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
													className: "block text-xs font-semibold text-gray-600 mb-1",
													children: "Naziv događaja (npr. Speed Dating Zagreb)"
												}), /* @__PURE__ */ jsx("input", {
													required: true,
													type: "text",
													value: newEvent.title,
													onChange: (e) => setNewEvent({
														...newEvent,
														title: e.target.value
													}),
													className: "w-full px-3 py-2 rounded-lg border border-gray-300"
												})] }),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
													className: "block text-xs font-semibold text-gray-600 mb-1",
													children: "Dobna skupina (npr. 20–25 godina)"
												}), /* @__PURE__ */ jsx("input", {
													required: true,
													type: "text",
													value: newEvent.ageGroup,
													onChange: (e) => setNewEvent({
														...newEvent,
														ageGroup: e.target.value
													}),
													className: "w-full px-3 py-2 rounded-lg border border-gray-300"
												})] }),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
													className: "block text-xs font-semibold text-gray-600 mb-1",
													children: "Datum (npr. 17. rujna 2026.)"
												}), /* @__PURE__ */ jsx("input", {
													required: true,
													type: "text",
													value: newEvent.dateStr,
													onChange: (e) => setNewEvent({
														...newEvent,
														dateStr: e.target.value
													}),
													className: "w-full px-3 py-2 rounded-lg border border-gray-300"
												})] }),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
													className: "block text-xs font-semibold text-gray-600 mb-1",
													children: "Vrijeme (npr. 19:00)"
												}), /* @__PURE__ */ jsx("input", {
													required: true,
													type: "text",
													value: newEvent.timeStr,
													onChange: (e) => setNewEvent({
														...newEvent,
														timeStr: e.target.value
													}),
													className: "w-full px-3 py-2 rounded-lg border border-gray-300"
												})] }),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
													className: "block text-xs font-semibold text-gray-600 mb-1",
													children: "Lokacija (npr. Café de Paris, Zagreb)"
												}), /* @__PURE__ */ jsx("input", {
													required: true,
													type: "text",
													value: newEvent.location,
													onChange: (e) => setNewEvent({
														...newEvent,
														location: e.target.value
													}),
													className: "w-full px-3 py-2 rounded-lg border border-gray-300"
												})] }),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
													className: "block text-xs font-semibold text-gray-600 mb-1",
													children: "Cijena / Kotizacija (npr. 10 € (uključena 2 pića))"
												}), /* @__PURE__ */ jsx("input", {
													required: true,
													type: "text",
													value: newEvent.price,
													onChange: (e) => setNewEvent({
														...newEvent,
														price: e.target.value
													}),
													className: "w-full px-3 py-2 rounded-lg border border-gray-300"
												})] }),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
													className: "block text-xs font-semibold text-gray-600 mb-1",
													children: "Maksimalan broj prijava (ostavi prazno za neograničeno)"
												}), /* @__PURE__ */ jsx("input", {
													type: "number",
													min: "1",
													value: newEvent.maxRegistrations,
													onChange: (e) => setNewEvent({
														...newEvent,
														maxRegistrations: e.target.value
													}),
													className: "w-full px-3 py-2 rounded-lg border border-gray-300",
													placeholder: "Npr. 40"
												})] })
											]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "mt-6 border-t border-gray-200 pt-4",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex justify-between items-center mb-4",
												children: [/* @__PURE__ */ jsx("h4", {
													className: "font-semibold text-gray-700",
													children: "Dodatna prilagođena polja (opcionalno)"
												}), /* @__PURE__ */ jsxs("button", {
													type: "button",
													onClick: () => setNewCustomFields([...newCustomFields, {
														id: `cf_${Date.now()}`,
														label: "",
														type: "text",
														required: false
													}]),
													className: "bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors flex items-center gap-1",
													children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " Dodaj polje"]
												})]
											}), newCustomFields.length === 0 ? /* @__PURE__ */ jsx("p", {
												className: "text-xs text-gray-500 italic",
												children: "Nema dodanih prilagođenih polja."
											}) : /* @__PURE__ */ jsx("div", {
												className: "space-y-3",
												children: newCustomFields.map((field, index) => /* @__PURE__ */ jsxs("div", {
													className: "bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative",
													children: [
														/* @__PURE__ */ jsx("button", {
															type: "button",
															onClick: () => setNewCustomFields(newCustomFields.filter((_, i) => i !== index)),
															className: "absolute top-2 right-2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-10",
															title: "Obriši polje",
															children: /* @__PURE__ */ jsx(Trash2, { size: 16 })
														}),
														/* @__PURE__ */ jsxs("div", {
															className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2",
															children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
																className: "block text-xs font-semibold text-gray-600 mb-1",
																children: "Naziv polja (Pitanje)"
															}), /* @__PURE__ */ jsx("input", {
																required: true,
																type: "text",
																value: field.label,
																onChange: (e) => {
																	const updated = [...newCustomFields];
																	updated[index].label = e.target.value;
																	setNewCustomFields(updated);
																},
																className: "w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-brand focus:border-brand",
																placeholder: "Npr. Vaš Instagram profil"
															})] }), /* @__PURE__ */ jsxs("div", {
																className: "relative",
																children: [
																	/* @__PURE__ */ jsx("label", {
																		className: "block text-xs font-semibold text-gray-600 mb-1",
																		children: "Tip polja"
																	}),
																	/* @__PURE__ */ jsxs("button", {
																		type: "button",
																		onClick: () => setOpenFieldDropdownIndex(openFieldDropdownIndex === index ? null : index),
																		className: "w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20",
																		children: [/* @__PURE__ */ jsxs("span", {
																			className: "truncate pr-2",
																			children: [
																				field.type === "text" && "Kratki tekst",
																				field.type === "textarea" && "Dugi tekst (Više linija)",
																				field.type === "select" && "Odabir jednog (Radio/Dropdown)",
																				field.type === "multiselect" && "Odabir više (Checkboxes)"
																			]
																		}), /* @__PURE__ */ jsx(ChevronDown, {
																			size: 14,
																			className: `text-gray-500 transition-transform duration-200 flex-shrink-0 ${openFieldDropdownIndex === index ? "rotate-180" : ""}`
																		})]
																	}),
																	openFieldDropdownIndex === index && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
																		className: "fixed inset-0 z-10",
																		onClick: () => setOpenFieldDropdownIndex(null)
																	}), /* @__PURE__ */ jsx("div", {
																		className: "absolute z-20 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1",
																		children: [
																			{
																				value: "text",
																				label: "Kratki tekst"
																			},
																			{
																				value: "textarea",
																				label: "Dugi tekst (Više linija)"
																			},
																			{
																				value: "select",
																				label: "Odabir jednog (Radio/Dropdown)"
																			},
																			{
																				value: "multiselect",
																				label: "Odabir više (Checkboxes)"
																			}
																		].map((option) => /* @__PURE__ */ jsx("button", {
																			type: "button",
																			onClick: () => {
																				const updated = [...newCustomFields];
																				updated[index].type = option.value;
																				setNewCustomFields(updated);
																				setOpenFieldDropdownIndex(null);
																			},
																			className: `w-full text-left px-3 py-2 text-sm transition-colors ${field.type === option.value ? "bg-brand/5 text-brand font-semibold" : "text-gray-700 hover:bg-gray-50"}`,
																			children: option.label
																		}, option.value))
																	})] })
																]
															})]
														}),
														(field.type === "select" || field.type === "multiselect") && /* @__PURE__ */ jsxs("div", {
															className: "mb-2",
															children: [/* @__PURE__ */ jsx("label", {
																className: "block text-xs font-semibold text-gray-600 mb-1",
																children: "Opcije (odvojene zarezom)"
															}), /* @__PURE__ */ jsx("input", {
																required: true,
																type: "text",
																value: field.rawOptions !== void 0 ? field.rawOptions : field.options?.join(", ") || "",
																onChange: (e) => {
																	const updated = [...newCustomFields];
																	updated[index].rawOptions = e.target.value;
																	setNewCustomFields(updated);
																},
																className: "w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-brand focus:border-brand",
																placeholder: "Opcija 1, Opcija 2, Opcija 3"
															})]
														}),
														/* @__PURE__ */ jsxs("div", {
															className: "flex items-center gap-2",
															children: [/* @__PURE__ */ jsx("input", {
																type: "checkbox",
																id: `req_${field.id}`,
																checked: field.required,
																onChange: (e) => {
																	const updated = [...newCustomFields];
																	updated[index].required = e.target.checked;
																	setNewCustomFields(updated);
																},
																className: "w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"
															}), /* @__PURE__ */ jsx("label", {
																htmlFor: `req_${field.id}`,
																className: "text-xs font-medium text-gray-700 cursor-pointer",
																children: "Obavezno polje"
															})]
														})
													]
												}, field.id))
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "mt-8 border-t border-gray-200 pt-6",
											children: [
												/* @__PURE__ */ jsx("h4", {
													className: "font-semibold text-gray-800 mb-4",
													children: "Live pregled i uređivanje E-maila (potvrda prijave)"
												}),
												/* @__PURE__ */ jsx("p", {
													className: "text-xs text-gray-500 mb-6",
													children: "Uredi tekst u isprekidanim okvirima ispod. Podaci iz gornjih polja (datum, cijena...) se automatski ubacuju u mail."
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm font-sans",
													style: {
														maxWidth: "600px",
														margin: "0 auto"
													},
													children: [
														/* @__PURE__ */ jsxs("div", {
															className: "text-center mb-6 pb-5 border-b border-gray-100",
															children: [/* @__PURE__ */ jsx("h1", {
																className: "text-[#E85D75] text-2xl font-bold uppercase tracking-wider mb-1",
																children: "Na prvi pogled"
															}), /* @__PURE__ */ jsx("p", {
																className: "text-gray-500 text-sm",
																children: "Potvrda prijave za speed dating"
															})]
														}),
														/* @__PURE__ */ jsxs("p", {
															className: "mb-4",
															children: [
																"Draga/i ",
																/* @__PURE__ */ jsx("strong", { children: "[Ime Korisnika]" }),
																","
															]
														}),
														/* @__PURE__ */ jsx("textarea", {
															required: true,
															value: newEvent.introText,
															onChange: (e) => setNewEvent({
																...newEvent,
																introText: e.target.value
															}),
															className: "w-full px-3 py-2 rounded border border-dashed border-gray-300 bg-gray-50 text-gray-700 resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand mb-4 text-sm",
															rows: 2
														}),
														/* @__PURE__ */ jsx("div", {
															className: "bg-[#FFF0F2] border-l-4 border-[#E85D75] p-4 my-6 rounded-r-lg",
															children: /* @__PURE__ */ jsx("p", {
																className: "text-[#E85D75] font-bold m-0",
																children: "Ovim mailom potvrđujemo tvoju prijavu!"
															})
														}),
														/* @__PURE__ */ jsx("p", {
															className: "mb-4 text-sm",
															children: "Mi ćemo se pobrinuti za organizaciju i tvoje iskustvo, a na tebi je samo da dođeš, opustiš se i budeš svoj/a."
														}),
														/* @__PURE__ */ jsx("textarea", {
															required: true,
															value: newEvent.noteText,
															onChange: (e) => setNewEvent({
																...newEvent,
																noteText: e.target.value
															}),
															className: "w-full px-3 py-2 rounded border border-dashed border-gray-300 bg-[#f9f9f9] text-gray-600 resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand mb-6 text-sm",
															rows: 2
														}),
														/* @__PURE__ */ jsxs("div", {
															className: "my-8 py-5 border-y border-gray-100",
															children: [/* @__PURE__ */ jsx("h3", {
																className: "text-gray-800 font-bold mb-4 uppercase text-sm",
																children: "Detalji eventa:"
															}), /* @__PURE__ */ jsx("table", {
																className: "w-full text-sm",
																children: /* @__PURE__ */ jsxs("tbody", { children: [
																	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", {
																		className: "py-2 w-8 text-lg",
																		children: "📅"
																	}), /* @__PURE__ */ jsx("td", {
																		className: "py-2",
																		children: /* @__PURE__ */ jsx("strong", { children: newEvent.dateStr || "[Datum]" })
																	})] }),
																	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", {
																		className: "py-2 text-lg",
																		children: "🕖"
																	}), /* @__PURE__ */ jsx("td", {
																		className: "py-2",
																		children: /* @__PURE__ */ jsx("strong", { children: newEvent.timeStr || "[Vrijeme]" })
																	})] }),
																	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", {
																		className: "py-2 text-lg align-top pt-3",
																		children: "⏰"
																	}), /* @__PURE__ */ jsx("td", {
																		className: "py-2",
																		children: /* @__PURE__ */ jsx("textarea", {
																			required: true,
																			value: newEvent.timeNote,
																			onChange: (e) => setNewEvent({
																				...newEvent,
																				timeNote: e.target.value
																			}),
																			className: "w-full px-2 py-1 rounded border border-dashed border-gray-300 bg-[#f9f9f9] text-[#E85D75] font-semibold resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand text-sm m-0",
																			rows: 2
																		})
																	})] }),
																	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", {
																		className: "py-2 text-lg",
																		children: "📍"
																	}), /* @__PURE__ */ jsx("td", {
																		className: "py-2",
																		children: /* @__PURE__ */ jsx("strong", { children: newEvent.location || "[Lokacija]" })
																	})] }),
																	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", {
																		className: "py-2 text-lg",
																		children: "🎂"
																	}), /* @__PURE__ */ jsxs("td", {
																		className: "py-2",
																		children: ["Dobna skupina: ", /* @__PURE__ */ jsx("strong", { children: newEvent.ageGroup || "[Dob]" })]
																	})] }),
																	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", {
																		className: "py-2 text-lg",
																		children: "💳"
																	}), /* @__PURE__ */ jsxs("td", {
																		className: "py-2",
																		children: ["Kotizacija: ", /* @__PURE__ */ jsx("strong", { children: newEvent.price || "[Cijena]" })]
																	})] })
																] })
															})]
														}),
														/* @__PURE__ */ jsx("textarea", {
															required: true,
															value: newEvent.closingText,
															onChange: (e) => setNewEvent({
																...newEvent,
																closingText: e.target.value
															}),
															className: "w-full px-3 py-2 rounded border border-dashed border-gray-300 bg-[#fafafa] text-gray-700 text-center resize-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-brand mb-8 text-sm",
															rows: 4
														}),
														/* @__PURE__ */ jsx("div", {
															className: "text-center mt-10 mb-5",
															children: /* @__PURE__ */ jsx("p", {
																className: "text-lg font-bold text-[#E85D75]",
																children: "Vidimo se uskoro! ✨"
															})
														}),
														/* @__PURE__ */ jsx("div", {
															className: "mt-8 border-t border-gray-100 pt-5",
															children: /* @__PURE__ */ jsxs("p", {
																className: "text-sm text-gray-500 m-0",
																children: [
																	"Srdačan pozdrav,",
																	/* @__PURE__ */ jsx("br", {}),
																	/* @__PURE__ */ jsx("strong", {
																		className: "text-gray-700",
																		children: "tim Na prvi pogled"
																	})
																]
															})
														})
													]
												})
											]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200",
											children: [/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: handleCancelEdit,
												className: "px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg",
												children: "Odustani"
											}), /* @__PURE__ */ jsx("button", {
												type: "submit",
												className: "bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-light",
												children: editingEventId ? "Spremi promjene" : "Spremi događaj"
											})]
										})
									]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "space-y-4",
									children: eventsLoading ? /* @__PURE__ */ jsxs("p", {
										className: "text-gray-500 py-4 flex items-center gap-2",
										children: [/* @__PURE__ */ jsx(Loader2, {
											className: "animate-spin",
											size: 16
										}), " Učitavanje..."]
									}) : events.length === 0 ? /* @__PURE__ */ jsx("p", {
										className: "text-gray-500 py-4",
										children: "Nema kreiranih događaja."
									}) : events.map((event) => /* @__PURE__ */ jsxs("div", {
										className: `p-4 rounded-xl border ${event.isActive ? "border-brand bg-brand/5" : "border-gray-200 bg-white"} flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all`,
										children: [/* @__PURE__ */ jsxs("div", { children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2 mb-1",
												children: [/* @__PURE__ */ jsx("h3", {
													className: "font-bold text-gray-900",
													children: event.title
												}), event.isActive && /* @__PURE__ */ jsxs("span", {
													className: "bg-brand text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
													children: [/* @__PURE__ */ jsx(CheckCircle2, { size: 12 }), " Aktivno"]
												})]
											}),
											/* @__PURE__ */ jsxs("p", {
												className: "text-sm text-gray-600",
												children: [
													event.dateStr,
													" u ",
													event.timeStr,
													" • ",
													event.location
												]
											}),
											/* @__PURE__ */ jsxs("p", {
												className: "text-xs text-gray-500 mt-1",
												children: [
													"Dob: ",
													event.ageGroup,
													" | Cijena: ",
													event.price,
													" ",
													event.maxRegistrations ? `| Max prijava: ${event.maxRegistrations}` : ""
												]
											})
										] }), /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ jsxs("button", {
												onClick: () => openEditEvent(event),
												className: "px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors bg-white hover:bg-gray-100 border border-gray-200 text-gray-700",
												children: [
													/* @__PURE__ */ jsx(Pencil, { size: 16 }),
													" ",
													/* @__PURE__ */ jsx("span", {
														className: "hidden sm:inline",
														children: "Uredi"
													})
												]
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => toggleEventActive(event),
												className: `px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${event.isActive ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"}`,
												children: event.isActive ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(StopCircle, { size: 16 }), " Završi / Deaktiviraj"] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PlayCircle, { size: 16 }), " Postavi kao Aktivno"] })
											})]
										})]
									}, event.id))
								})
							]
						})
					}),
					activeTab === "prijave" && /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100",
							children: [
								/* @__PURE__ */ jsxs("label", {
									className: "font-semibold text-gray-700 text-sm flex items-center gap-2",
									children: [/* @__PURE__ */ jsx(Calendar, {
										size: 16,
										className: "text-brand"
									}), " Prikaži prijave za događaj:"]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "relative w-full sm:w-80",
									children: [/* @__PURE__ */ jsxs("button", {
										onClick: () => setFilterDropdownOpen(!filterDropdownOpen),
										className: "w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20",
										children: [/* @__PURE__ */ jsx("span", {
											className: "truncate pr-4 font-medium",
											children: selectedEventId === "" ? "-- Svi događaji (Stare prijave) --" : events.find((e) => e.id === selectedEventId)?.title || "Nepoznat događaj"
										}), /* @__PURE__ */ jsx(ChevronDown, {
											size: 16,
											className: `text-gray-500 transition-transform duration-200 ${filterDropdownOpen ? "rotate-180" : ""}`
										})]
									}), filterDropdownOpen && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
										className: "fixed inset-0 z-30",
										onClick: () => setFilterDropdownOpen(false)
									}), /* @__PURE__ */ jsxs("div", {
										className: "absolute z-40 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 max-h-60 overflow-y-auto transform opacity-100 scale-100 transition-all origin-top",
										children: [/* @__PURE__ */ jsx("button", {
											onClick: () => {
												setSelectedEventId("");
												setFilterDropdownOpen(false);
											},
											className: `w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 ${selectedEventId === "" ? "bg-brand/5 text-brand font-semibold" : "text-gray-700 hover:bg-gray-50"}`,
											children: "-- Svi događaji (Stare prijave) --"
										}), events.map((e) => /* @__PURE__ */ jsxs("button", {
											onClick: () => {
												setSelectedEventId(e.id);
												setFilterDropdownOpen(false);
											},
											className: `w-full text-left px-4 py-3 text-sm transition-colors flex flex-col ${selectedEventId === e.id ? "bg-brand/5 text-brand font-semibold" : "text-gray-700 hover:bg-gray-50"}`,
											children: [/* @__PURE__ */ jsxs("span", {
												className: "flex items-center justify-between w-full",
												children: [/* @__PURE__ */ jsx("span", {
													className: "truncate",
													children: e.title
												}), e.isActive && /* @__PURE__ */ jsx("span", {
													className: "bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2",
													children: "Aktivno"
												})]
											}), /* @__PURE__ */ jsx("span", {
												className: "text-xs text-gray-400 font-normal mt-0.5",
												children: e.dateStr
											})]
										}, e.id))]
									})] })]
								}),
								/* @__PURE__ */ jsx("button", {
									onClick: () => fetchPrijave(selectedEventId),
									className: "ml-auto bg-brand/10 text-brand px-5 py-3 rounded-xl text-sm font-semibold hover:bg-brand/20 transition-colors flex items-center gap-2",
									children: "Osvježi"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4",
									children: [/* @__PURE__ */ jsx("div", {
										className: "bg-brand/10 p-3 rounded-full text-brand",
										children: /* @__PURE__ */ jsx(Users, { size: 24 })
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm text-gray-500 font-medium",
										children: "Ukupno prijava"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-2xl font-bold",
										children: total
									})] })]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4",
									children: [/* @__PURE__ */ jsx("div", {
										className: "bg-pink-100 p-3 rounded-full text-pink-600",
										children: /* @__PURE__ */ jsx(UserRound, { size: 24 })
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm text-gray-500 font-medium",
										children: "Žene"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-2xl font-bold",
										children: femaleCount
									})] })]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4",
									children: [/* @__PURE__ */ jsx("div", {
										className: "bg-blue-100 p-3 rounded-full text-blue-600",
										children: /* @__PURE__ */ jsx(UserRound, { size: 24 })
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm text-gray-500 font-medium",
										children: "Muškarci"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-2xl font-bold",
										children: maleCount
									})] })]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4",
									children: [/* @__PURE__ */ jsx("div", {
										className: "bg-purple-100 p-3 rounded-full text-purple-600",
										children: /* @__PURE__ */ jsx(ArrowDown01, { size: 24 })
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm text-gray-500 font-medium",
										children: "Prosjek godina"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-2xl font-bold",
										children: avgAge
									})] })]
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden",
							children: /* @__PURE__ */ jsx("div", {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ jsxs("table", {
									className: "w-full text-left border-collapse",
									children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
										className: "bg-gray-50 border-b border-gray-100",
										children: [
											/* @__PURE__ */ jsx("th", {
												className: "p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider",
												children: "Ime i prezime"
											}),
											/* @__PURE__ */ jsx("th", {
												className: "p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider",
												children: "Email"
											}),
											/* @__PURE__ */ jsx("th", {
												className: "p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider",
												children: "Spol"
											}),
											/* @__PURE__ */ jsx("th", {
												className: "p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider",
												children: "Godine"
											}),
											/* @__PURE__ */ jsx("th", {
												className: "p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider",
												children: "Napomena"
											}),
											/* @__PURE__ */ jsx("th", {
												className: "p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider",
												children: "Status"
											}),
											/* @__PURE__ */ jsx("th", {
												className: "p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider",
												children: "Datum"
											})
										]
									}) }), /* @__PURE__ */ jsx("tbody", {
										className: "divide-y divide-gray-100",
										children: dataLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
											colSpan: 6,
											className: "p-8 text-center text-gray-500",
											children: /* @__PURE__ */ jsxs("div", {
												className: "flex justify-center items-center gap-2",
												children: [/* @__PURE__ */ jsx(Loader2, {
													className: "animate-spin",
													size: 16
												}), " Učitavanje podataka..."]
											})
										}) }) : prijave.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
											colSpan: 6,
											className: "p-8 text-center text-gray-500",
											children: "Još nema pristiglih prijava za odabrani događaj."
										}) }) : prijave.map((prijava) => /* @__PURE__ */ jsxs("tr", {
											onClick: () => setSelectedPrijava(prijava),
											className: "hover:bg-brand/5 cursor-pointer transition-colors group",
											children: [
												/* @__PURE__ */ jsx("td", {
													className: "p-4 font-medium text-brand group-hover:text-brand-light",
													children: prijava.imePrezime
												}),
												/* @__PURE__ */ jsx("td", {
													className: "p-4 text-gray-600 text-sm",
													children: prijava.email
												}),
												/* @__PURE__ */ jsx("td", {
													className: "p-4",
													children: /* @__PURE__ */ jsx("span", {
														className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${prijava.spol === "Ž" ? "bg-pink-100 text-pink-700" : prijava.spol === "M" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`,
														children: prijava.spol
													})
												}),
												/* @__PURE__ */ jsx("td", {
													className: "p-4 text-gray-600",
													children: prijava.godine
												}),
												/* @__PURE__ */ jsx("td", {
													className: "p-4 text-gray-600 text-sm max-w-xs truncate",
													title: prijava.napomena,
													children: prijava.napomena || "-"
												}),
												/* @__PURE__ */ jsx("td", {
													className: "p-4",
													children: /* @__PURE__ */ jsx("span", {
														className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${prijava.status === "pending" ? "bg-yellow-100 text-yellow-700" : prijava.status === "rejected" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`,
														children: prijava.status === "pending" ? "Na čekanju" : prijava.status === "rejected" ? "Odbijeno" : "Prihvaćeno"
													})
												}),
												/* @__PURE__ */ jsx("td", {
													className: "p-4 text-gray-500 text-xs",
													children: prijava.createdAt?.toDate ? prijava.createdAt.toDate().toLocaleString("hr-HR") : "Nedavno"
												})
											]
										}, prijava.id))
									})]
								})
							})
						})
					] })
				]
			}),
			selectedPrijava && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between p-6 border-b border-gray-100",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "text-xl font-serif font-bold text-brand",
								children: "Detalji Prijave"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setSelectedPrijava(null),
								className: "p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors",
								children: /* @__PURE__ */ jsx(X, { size: 20 })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-6 overflow-y-auto flex-1 space-y-6",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "mb-2",
									children: /* @__PURE__ */ jsx("span", {
										className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${selectedPrijava.status === "pending" ? "bg-yellow-100 text-yellow-700" : selectedPrijava.status === "rejected" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`,
										children: selectedPrijava.status === "pending" ? "Status: Na čekanju" : selectedPrijava.status === "rejected" ? "Status: Odbijeno" : "Status: Prihvaćeno"
									})
								}),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("h4", {
										className: "text-xs font-bold uppercase tracking-wider text-gray-400 mb-3",
										children: "Osnovni podaci"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "bg-gray-50 p-3 rounded-lg border border-gray-100",
												children: [/* @__PURE__ */ jsx("p", {
													className: "text-xs text-gray-500 mb-1",
													children: "Ime i prezime"
												}), /* @__PURE__ */ jsx("p", {
													className: "font-semibold text-gray-800",
													children: selectedPrijava.imePrezime
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "bg-gray-50 p-3 rounded-lg border border-gray-100",
												children: [/* @__PURE__ */ jsx("p", {
													className: "text-xs text-gray-500 mb-1",
													children: "Email"
												}), /* @__PURE__ */ jsx("p", {
													className: "font-semibold text-gray-800",
													children: selectedPrijava.email
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "bg-gray-50 p-3 rounded-lg border border-gray-100",
												children: [/* @__PURE__ */ jsx("p", {
													className: "text-xs text-gray-500 mb-1",
													children: "Spol"
												}), /* @__PURE__ */ jsx("p", {
													className: "font-semibold text-gray-800",
													children: selectedPrijava.spol
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "bg-gray-50 p-3 rounded-lg border border-gray-100",
												children: [/* @__PURE__ */ jsx("p", {
													className: "text-xs text-gray-500 mb-1",
													children: "Godine"
												}), /* @__PURE__ */ jsx("p", {
													className: "font-semibold text-gray-800",
													children: selectedPrijava.godine
												})]
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bg-gray-50 p-3 rounded-lg border border-gray-100 mt-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "text-xs text-gray-500 mb-1",
											children: "Napomena"
										}), /* @__PURE__ */ jsx("p", {
											className: "font-medium text-gray-800 whitespace-pre-wrap",
											children: selectedPrijava.napomena || "Nema napomene"
										})]
									})
								] }),
								selectedPrijava.customAnswers && selectedPrijava.customAnswers.length > 0 && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
									className: "text-xs font-bold uppercase tracking-wider text-gray-400 mb-3",
									children: "Prilagođena polja"
								}), /* @__PURE__ */ jsx("div", {
									className: "space-y-3",
									children: selectedPrijava.customAnswers.map((answer, i) => /* @__PURE__ */ jsxs("div", {
										className: "bg-brand/5 p-4 rounded-lg border border-brand/10",
										children: [/* @__PURE__ */ jsx("p", {
											className: "text-xs font-semibold text-brand/70 mb-1",
											children: answer.label
										}), /* @__PURE__ */ jsx("p", {
											className: "font-medium text-gray-900",
											children: Array.isArray(answer.value) ? answer.value.join(", ") : answer.value?.toString() || "-"
										})]
									}, i))
								})] })
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center flex-wrap gap-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex gap-2 flex-wrap",
								children: [/* @__PURE__ */ jsxs("button", {
									onClick: () => setDeleteModalOpen(true),
									className: "px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ jsx(Trash2, { size: 16 }), " Izbriši"]
								}), selectedPrijava.status === "pending" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
									onClick: () => handleAcceptPrijava(selectedPrijava),
									disabled: actionLoading,
									className: "px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50",
									children: [/* @__PURE__ */ jsx(CheckCircle2, { size: 16 }), " Prihvati"]
								}), /* @__PURE__ */ jsxs("button", {
									onClick: () => setRejectModalOpen(true),
									disabled: actionLoading,
									className: "px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50",
									children: [/* @__PURE__ */ jsx(X, { size: 16 }), " Odbij"]
								})] })]
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setSelectedPrijava(null),
								className: "w-full sm:w-auto px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors",
								children: "Zatvori"
							})]
						})
					]
				})
			}),
			rejectModalOpen && selectedPrijava && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between p-6 border-b border-gray-100",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "text-xl font-serif font-bold text-brand flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(X, {
									size: 20,
									className: "text-yellow-600"
								}), "Odbijanje Prijave"]
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setRejectModalOpen(false),
								className: "p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors",
								children: /* @__PURE__ */ jsx(X, { size: 20 })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-6",
							children: [
								/* @__PURE__ */ jsxs("p", {
									className: "text-sm text-gray-600 mb-4",
									children: [
										"Odaberi razlog odbijanja za korisnika ",
										/* @__PURE__ */ jsx("strong", { children: selectedPrijava.imePrezime }),
										". Ovaj tekst bit će uključen u email poruku."
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "relative mb-6",
									children: [
										/* @__PURE__ */ jsx("label", {
											className: "block text-xs font-semibold text-gray-600 mb-1",
											children: "Razlog odbijanja"
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setRejectDropdownOpen(!rejectDropdownOpen),
											className: "w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20",
											children: [/* @__PURE__ */ jsx("span", {
												className: "truncate pr-2 font-medium",
												children: REJECT_REASONS.find((r) => r.text === rejectReason)?.label || "Prilagođeni razlog"
											}), /* @__PURE__ */ jsx(ChevronDown, {
												size: 16,
												className: `text-gray-500 transition-transform duration-200 flex-shrink-0 ${rejectDropdownOpen ? "rotate-180" : ""}`
											})]
										}),
										rejectDropdownOpen && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
											className: "fixed inset-0 z-10",
											onClick: () => setRejectDropdownOpen(false)
										}), /* @__PURE__ */ jsx("div", {
											className: "absolute z-20 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1",
											children: REJECT_REASONS.map((option) => /* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => {
													setRejectReason(option.text);
													setRejectDropdownOpen(false);
												},
												className: `w-full text-left px-4 py-3 text-sm transition-colors ${rejectReason === option.text ? "bg-brand/5 text-brand font-semibold" : "text-gray-700 hover:bg-gray-50"}`,
												children: option.label
											}, option.id))
										})] })
									]
								}),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "block text-xs font-semibold text-gray-600 mb-1",
										children: "Tekst u emailu"
									}),
									/* @__PURE__ */ jsx("textarea", {
										value: rejectReason,
										onChange: (e) => setRejectReason(e.target.value),
										className: "w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-brand focus:border-brand text-sm bg-gray-50 min-h-[100px]",
										placeholder: "Unesite razlog odbijanja..."
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xs text-gray-500 mt-1",
										children: "Možeš urediti tekst prije slanja."
									})
								] })
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: () => setRejectModalOpen(false),
								className: "px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors",
								children: "Odustani"
							}), /* @__PURE__ */ jsxs("button", {
								onClick: confirmRejectPrijava,
								disabled: actionLoading || !rejectReason.trim(),
								className: "px-6 py-2 bg-yellow-600 text-white hover:bg-yellow-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50",
								children: [actionLoading ? /* @__PURE__ */ jsx(Loader2, {
									size: 16,
									className: "animate-spin"
								}) : /* @__PURE__ */ jsx(X, { size: 16 }), "Potvrdi i pošalji email"]
							})]
						})
					]
				})
			}),
			deleteModalOpen && selectedPrijava && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between p-6 border-b border-gray-100",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "text-xl font-serif font-bold text-red-600 flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Trash2, {
									size: 20,
									className: "text-red-500"
								}), "Brisanje prijave"]
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setDeleteModalOpen(false),
								className: "p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors",
								children: /* @__PURE__ */ jsx(X, { size: 20 })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-6",
							children: [/* @__PURE__ */ jsxs("p", {
								className: "text-gray-700 mb-2",
								children: [
									"Jeste li sigurni da želite obrisati prijavu korisnika ",
									/* @__PURE__ */ jsx("strong", {
										className: "text-gray-900",
										children: selectedPrijava.imePrezime
									}),
									"?"
								]
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-red-500 font-medium",
								children: "Ova akcija je nepovratna i trajno uklanja podatke."
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: () => setDeleteModalOpen(false),
								className: "px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors",
								children: "Odustani"
							}), /* @__PURE__ */ jsxs("button", {
								onClick: confirmDeletePrijava,
								disabled: actionLoading,
								className: "px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50",
								children: [actionLoading ? /* @__PURE__ */ jsx(Loader2, {
									size: 16,
									className: "animate-spin"
								}) : /* @__PURE__ */ jsx(Trash2, { size: 16 }), "Obriši prijavu"]
							})]
						})
					]
				})
			})
		]
	});
});
//#endregion
//#region \0virtual:react-router/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-DWSigjjp.js",
		"imports": ["/assets/jsx-runtime-C0pkcs0A.js"],
		"css": []
	},
	"routes": {
		"root": {
			"id": "root",
			"parentId": void 0,
			"path": "",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/root-BDWLLhW0.js",
			"imports": ["/assets/jsx-runtime-C0pkcs0A.js", "/assets/lib-Da1Bia7i.js"],
			"css": ["/assets/root-D6_GNock.css"],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"../pages/Home": {
			"id": "../pages/Home",
			"parentId": "root",
			"path": void 0,
			"index": true,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/Home-CnX9-pwn.js",
			"imports": [
				"/assets/jsx-runtime-C0pkcs0A.js",
				"/assets/lib-Da1Bia7i.js",
				"/assets/firebase-DiZ3cVDW.js",
				"/assets/users-6dJz1WX8.js",
				"/assets/fa-a4k4pWhA.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"../pages/FormPage": {
			"id": "../pages/FormPage",
			"parentId": "root",
			"path": "prijava",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/FormPage-CU13zbt8.js",
			"imports": [
				"/assets/jsx-runtime-C0pkcs0A.js",
				"/assets/lib-Da1Bia7i.js",
				"/assets/firebase-DiZ3cVDW.js",
				"/assets/circle-check-Duua9L64.js",
				"/assets/fa-a4k4pWhA.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"../pages/AdminDashboard": {
			"id": "../pages/AdminDashboard",
			"parentId": "root",
			"path": "admin",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/AdminDashboard-B2wEDec-.js",
			"imports": [
				"/assets/jsx-runtime-C0pkcs0A.js",
				"/assets/lib-Da1Bia7i.js",
				"/assets/firebase-DiZ3cVDW.js",
				"/assets/circle-check-Duua9L64.js",
				"/assets/users-6dJz1WX8.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		}
	},
	"url": "/assets/manifest-c20d7d1b.js",
	"version": "c20d7d1b",
	"sri": void 0
};
//#endregion
//#region \0virtual:react-router/server-build
var assetsBuildDirectory = "build\\client";
var basename = "/";
var future = {
	"unstable_enableNodeReadableStream": false,
	"unstable_optimizeDeps": false
};
var ssr = false;
var isSpaMode = false;
var prerender = [
	"/",
	"/prijava",
	"/admin"
];
var routeDiscovery = { "mode": "initial" };
var publicPath = "/";
var entry = { module: entry_server_web_exports };
var routes = {
	"root": {
		id: "root",
		parentId: void 0,
		path: "",
		index: void 0,
		caseSensitive: void 0,
		module: root_exports
	},
	"../pages/Home": {
		id: "../pages/Home",
		parentId: "root",
		path: void 0,
		index: true,
		caseSensitive: void 0,
		module: Home_exports
	},
	"../pages/FormPage": {
		id: "../pages/FormPage",
		parentId: "root",
		path: "prijava",
		index: void 0,
		caseSensitive: void 0,
		module: FormPage_exports
	},
	"../pages/AdminDashboard": {
		id: "../pages/AdminDashboard",
		parentId: "root",
		path: "admin",
		index: void 0,
		caseSensitive: void 0,
		module: AdminDashboard_exports
	}
};
var allowedActionOrigins = false;
//#endregion
export { allowedActionOrigins, server_manifest_default as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, prerender, publicPath, routeDiscovery, routes, ssr };

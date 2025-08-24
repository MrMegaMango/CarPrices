--
-- PostgreSQL database dump
--

\restrict esC6cyfffqsQyeomg7wIzJM6odug4L1PgJ4gG39snuKAqbyvdHtsec6v5PqlaEu

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users_sync; Type: TABLE; Schema: neon_auth; Owner: neondb_owner
--

CREATE TABLE neon_auth.users_sync (
    raw_json jsonb NOT NULL,
    id text GENERATED ALWAYS AS ((raw_json ->> 'id'::text)) STORED NOT NULL,
    name text GENERATED ALWAYS AS ((raw_json ->> 'display_name'::text)) STORED,
    email text GENERATED ALWAYS AS ((raw_json ->> 'primary_email'::text)) STORED,
    created_at timestamp with time zone GENERATED ALWAYS AS (to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision))) STORED,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE neon_auth.users_sync OWNER TO neondb_owner;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public.accounts OWNER TO neondb_owner;

--
-- Name: car_deals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.car_deals (
    id text NOT NULL,
    "userId" text NOT NULL,
    "makeId" text NOT NULL,
    "modelId" text NOT NULL,
    year integer NOT NULL,
    "trim" text,
    color text,
    msrp integer NOT NULL,
    "sellingPrice" integer NOT NULL,
    "otdPrice" integer,
    rebates integer,
    "tradeInValue" integer,
    "dealerName" text,
    "dealerLocation" text,
    "dealDate" timestamp(3) without time zone NOT NULL,
    "financingRate" double precision,
    "financingTerm" integer,
    "downPayment" integer,
    "monthlyPayment" integer,
    notes text,
    "isLeased" boolean DEFAULT false NOT NULL,
    "leaseTermMonths" integer,
    "mileageAllowance" integer,
    verified boolean DEFAULT false NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.car_deals OWNER TO neondb_owner;

--
-- Name: car_makes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.car_makes (
    id text NOT NULL,
    name text NOT NULL,
    logo text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.car_makes OWNER TO neondb_owner;

--
-- Name: car_models; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.car_models (
    id text NOT NULL,
    name text NOT NULL,
    "makeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.car_models OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    image text,
    "emailVerified" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: verificationtokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.verificationtokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verificationtokens OWNER TO neondb_owner;

--
-- Data for Name: users_sync; Type: TABLE DATA; Schema: neon_auth; Owner: neondb_owner
--

COPY neon_auth.users_sync (raw_json, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: car_deals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.car_deals (id, "userId", "makeId", "modelId", year, "trim", color, msrp, "sellingPrice", "otdPrice", rebates, "tradeInValue", "dealerName", "dealerLocation", "dealDate", "financingRate", "financingTerm", "downPayment", "monthlyPayment", notes, "isLeased", "leaseTermMonths", "mileageAllowance", verified, "isPublic", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: car_makes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.car_makes (id, name, logo, "createdAt", "updatedAt") FROM stdin;
cmep5r62c0000uze78ycsa7et	Toyota	\N	2025-08-24 03:58:02.868	2025-08-24 03:58:02.868
cmep5r9ol000luze7g9d19nl9	Honda	\N	2025-08-24 03:58:07.557	2025-08-24 03:58:07.557
cmep5rdta0016uze7gc17hk73	Ford	\N	2025-08-24 03:58:12.911	2025-08-24 03:58:12.911
cmep5rh14001ruze74o4hihg4	Chevrolet	\N	2025-08-24 03:58:17.081	2025-08-24 03:58:17.081
cmep5rkeq002cuze78m6upnyo	Nissan	\N	2025-08-24 03:58:21.458	2025-08-24 03:58:21.458
cmep5rnkv002xuze7apiiuy8r	BMW	\N	2025-08-24 03:58:25.567	2025-08-24 03:58:25.567
cmep5rqqq003iuze70r2lkd9o	Mercedes-Benz	\N	2025-08-24 03:58:29.666	2025-08-24 03:58:29.666
cmep5ru1i0043uze7bpfrye3o	Audi	\N	2025-08-24 03:58:33.942	2025-08-24 03:58:33.942
cmep5rxch004ouze7am9hntqx	Lexus	\N	2025-08-24 03:58:38.225	2025-08-24 03:58:38.225
cmep5s0jt0059uze74dq2c767	Hyundai	\N	2025-08-24 03:58:42.378	2025-08-24 03:58:42.378
cmep5s3st005uuze7ipvm0r42	Kia	\N	2025-08-24 03:58:46.589	2025-08-24 03:58:46.589
cmep5s70p006fuze7mthpxldd	Subaru	\N	2025-08-24 03:58:50.762	2025-08-24 03:58:50.762
cmep5sa7p0070uze7acxj33kh	Mazda	\N	2025-08-24 03:58:54.902	2025-08-24 03:58:54.902
cmep5sdqi007luze7jdysahhz	Volkswagen	\N	2025-08-24 03:58:59.466	2025-08-24 03:58:59.466
cmep5sgwm0086uze7je634m7n	Jeep	\N	2025-08-24 03:59:03.574	2025-08-24 03:59:03.574
cmep5sk56008ruze79ka68dpp	Tesla	\N	2025-08-24 03:59:07.771	2025-08-24 03:59:07.771
cmep5sm6b0094uze7yfuwi9r0	Ram	\N	2025-08-24 03:59:10.403	2025-08-24 03:59:10.403
cmep5snw3009fuze7zyi3oqb6	GMC	\N	2025-08-24 03:59:12.627	2025-08-24 03:59:12.627
cmep5sq7a009uuze7e9ftonra	Cadillac	\N	2025-08-24 03:59:15.622	2025-08-24 03:59:15.622
cmep5ssvz00abuze7s28e2muh	Infiniti	\N	2025-08-24 03:59:19.027	2025-08-24 03:59:19.027
\.


--
-- Data for Name: car_models; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.car_models (id, name, "makeId", "createdAt", "updatedAt") FROM stdin;
cmep5r6j00002uze7dbpkehry	Camry	cmep5r62c0000uze78ycsa7et	2025-08-24 03:58:03.468	2025-08-24 03:58:03.468
cmep5r70w0004uze70548r0lc	Corolla	cmep5r62c0000uze78ycsa7et	2025-08-24 03:58:04.112	2025-08-24 03:58:04.112
cmep5r7bk0006uze76j4oyvdy	RAV4	cmep5r62c0000uze78ycsa7et	2025-08-24 03:58:04.496	2025-08-24 03:58:04.496
cmep5r7lz0008uze7qms101na	Highlander	cmep5r62c0000uze78ycsa7et	2025-08-24 03:58:04.871	2025-08-24 03:58:04.871
cmep5r7we000auze73z9kf6r9	Prius	cmep5r62c0000uze78ycsa7et	2025-08-24 03:58:05.247	2025-08-24 03:58:05.247
cmep5r86x000cuze7o02gppgl	Sienna	cmep5r62c0000uze78ycsa7et	2025-08-24 03:58:05.625	2025-08-24 03:58:05.625
cmep5r8hq000euze7fgvdfonh	Tacoma	cmep5r62c0000uze78ycsa7et	2025-08-24 03:58:06.015	2025-08-24 03:58:06.015
cmep5r8sc000guze70k38hmx4	Tundra	cmep5r62c0000uze78ycsa7et	2025-08-24 03:58:06.397	2025-08-24 03:58:06.397
cmep5r936000iuze7mus2k0pf	Avalon	cmep5r62c0000uze78ycsa7et	2025-08-24 03:58:06.786	2025-08-24 03:58:06.786
cmep5r9ea000kuze7w0r5uotk	Venza	cmep5r62c0000uze78ycsa7et	2025-08-24 03:58:07.186	2025-08-24 03:58:07.186
cmep5ra2p000nuze7omdwiqdg	Civic	cmep5r9ol000luze7g9d19nl9	2025-08-24 03:58:08.065	2025-08-24 03:58:08.065
cmep5rau1000puze7zsbpgkrr	Accord	cmep5r9ol000luze7g9d19nl9	2025-08-24 03:58:09.049	2025-08-24 03:58:09.049
cmep5rbgh000ruze76w5298p1	CR-V	cmep5r9ol000luze7g9d19nl9	2025-08-24 03:58:09.858	2025-08-24 03:58:09.858
cmep5rbqv000tuze7ujrr1diz	Pilot	cmep5r9ol000luze7g9d19nl9	2025-08-24 03:58:10.231	2025-08-24 03:58:10.231
cmep5rc1p000vuze7iei6nuu8	Insight	cmep5r9ol000luze7g9d19nl9	2025-08-24 03:58:10.621	2025-08-24 03:58:10.621
cmep5rccc000xuze7dxyls1zw	Passport	cmep5r9ol000luze7g9d19nl9	2025-08-24 03:58:11.004	2025-08-24 03:58:11.004
cmep5rcn3000zuze7cqddoty9	Ridgeline	cmep5r9ol000luze7g9d19nl9	2025-08-24 03:58:11.391	2025-08-24 03:58:11.391
cmep5rcxl0011uze7zxq8xmm0	HR-V	cmep5r9ol000luze7g9d19nl9	2025-08-24 03:58:11.769	2025-08-24 03:58:11.769
cmep5rd870013uze7defhtluq	Odyssey	cmep5r9ol000luze7g9d19nl9	2025-08-24 03:58:12.152	2025-08-24 03:58:12.152
cmep5rdiv0015uze7skz8dfp0	Fit	cmep5r9ol000luze7g9d19nl9	2025-08-24 03:58:12.535	2025-08-24 03:58:12.535
cmep5re400018uze7lbn1qmj4	F-150	cmep5rdta0016uze7gc17hk73	2025-08-24 03:58:13.297	2025-08-24 03:58:13.297
cmep5reeo001auze7mvwgfvvc	Mustang	cmep5rdta0016uze7gc17hk73	2025-08-24 03:58:13.68	2025-08-24 03:58:13.68
cmep5rep4001cuze70058fng6	Explorer	cmep5rdta0016uze7gc17hk73	2025-08-24 03:58:14.056	2025-08-24 03:58:14.056
cmep5rezo001euze7v9wlq45c	Escape	cmep5rdta0016uze7gc17hk73	2025-08-24 03:58:14.437	2025-08-24 03:58:14.437
cmep5rfa1001guze75d86hoj7	Edge	cmep5rdta0016uze7gc17hk73	2025-08-24 03:58:14.809	2025-08-24 03:58:14.809
cmep5rfkk001iuze75p85ywju	Expedition	cmep5rdta0016uze7gc17hk73	2025-08-24 03:58:15.189	2025-08-24 03:58:15.189
cmep5rfvg001kuze7qy0batkk	Ranger	cmep5rdta0016uze7gc17hk73	2025-08-24 03:58:15.58	2025-08-24 03:58:15.58
cmep5rg60001muze74v9ryni1	Bronco	cmep5rdta0016uze7gc17hk73	2025-08-24 03:58:15.96	2025-08-24 03:58:15.96
cmep5rggj001ouze7a4p5wov3	Maverick	cmep5rdta0016uze7gc17hk73	2025-08-24 03:58:16.339	2025-08-24 03:58:16.339
cmep5rgqu001quze7c5jj2aeg	Transit	cmep5rdta0016uze7gc17hk73	2025-08-24 03:58:16.711	2025-08-24 03:58:16.711
cmep5rhbh001tuze7chv5zh0m	Silverado	cmep5rh14001ruze74o4hihg4	2025-08-24 03:58:17.453	2025-08-24 03:58:17.453
cmep5rhlu001vuze7r8o5op68	Equinox	cmep5rh14001ruze74o4hihg4	2025-08-24 03:58:17.826	2025-08-24 03:58:17.826
cmep5rhyd001xuze7nl1tkt3u	Malibu	cmep5rh14001ruze74o4hihg4	2025-08-24 03:58:18.202	2025-08-24 03:58:18.202
cmep5ri8t001zuze7iyitonif	Tahoe	cmep5rh14001ruze74o4hihg4	2025-08-24 03:58:18.653	2025-08-24 03:58:18.653
cmep5rij80021uze7z9nohpfr	Suburban	cmep5rh14001ruze74o4hihg4	2025-08-24 03:58:19.028	2025-08-24 03:58:19.028
cmep5riyi0023uze7z23as4vz	Traverse	cmep5rh14001ruze74o4hihg4	2025-08-24 03:58:19.578	2025-08-24 03:58:19.578
cmep5rj920025uze7nzsdo8f2	Camaro	cmep5rh14001ruze74o4hihg4	2025-08-24 03:58:19.958	2025-08-24 03:58:19.958
cmep5rjje0027uze73nghp133	Corvette	cmep5rh14001ruze74o4hihg4	2025-08-24 03:58:20.33	2025-08-24 03:58:20.33
cmep5rjtx0029uze7q8zaaxs2	Colorado	cmep5rh14001ruze74o4hihg4	2025-08-24 03:58:20.709	2025-08-24 03:58:20.709
cmep5rk4c002buze7it1ghctw	Blazer	cmep5rh14001ruze74o4hihg4	2025-08-24 03:58:21.084	2025-08-24 03:58:21.084
cmep5rkp6002euze7y4li42bf	Altima	cmep5rkeq002cuze78m6upnyo	2025-08-24 03:58:21.834	2025-08-24 03:58:21.834
cmep5rkzk002guze7hhnd0eym	Sentra	cmep5rkeq002cuze78m6upnyo	2025-08-24 03:58:22.208	2025-08-24 03:58:22.208
cmep5rla1002iuze7f719pv0a	Rogue	cmep5rkeq002cuze78m6upnyo	2025-08-24 03:58:22.585	2025-08-24 03:58:22.585
cmep5rlkd002kuze78hjvmmaj	Murano	cmep5rkeq002cuze78m6upnyo	2025-08-24 03:58:22.957	2025-08-24 03:58:22.957
cmep5rlul002muze7ifcauy87	Pathfinder	cmep5rkeq002cuze78m6upnyo	2025-08-24 03:58:23.326	2025-08-24 03:58:23.326
cmep5rm4x002ouze7i5kp425s	Frontier	cmep5rkeq002cuze78m6upnyo	2025-08-24 03:58:23.698	2025-08-24 03:58:23.698
cmep5rmf6002quze7iz7u7hgu	Titan	cmep5rkeq002cuze78m6upnyo	2025-08-24 03:58:24.067	2025-08-24 03:58:24.067
cmep5rmps002suze796cy6wcd	Versa	cmep5rkeq002cuze78m6upnyo	2025-08-24 03:58:24.449	2025-08-24 03:58:24.449
cmep5rn04002uuze75s8o0i9b	Maxima	cmep5rkeq002cuze78m6upnyo	2025-08-24 03:58:24.821	2025-08-24 03:58:24.821
cmep5rnah002wuze7kl5gippt	Armada	cmep5rkeq002cuze78m6upnyo	2025-08-24 03:58:25.193	2025-08-24 03:58:25.193
cmep5rnv1002zuze7ix1gblrk	3 Series	cmep5rnkv002xuze7apiiuy8r	2025-08-24 03:58:25.934	2025-08-24 03:58:25.934
cmep5ro5f0031uze77pnsn9c0	5 Series	cmep5rnkv002xuze7apiiuy8r	2025-08-24 03:58:26.307	2025-08-24 03:58:26.307
cmep5rofy0033uze7r37cgprc	X3	cmep5rnkv002xuze7apiiuy8r	2025-08-24 03:58:26.686	2025-08-24 03:58:26.686
cmep5roq80035uze7ooesyihs	X5	cmep5rnkv002xuze7apiiuy8r	2025-08-24 03:58:27.057	2025-08-24 03:58:27.057
cmep5rp0r0037uze7d3arax3b	X1	cmep5rnkv002xuze7apiiuy8r	2025-08-24 03:58:27.436	2025-08-24 03:58:27.436
cmep5rpb40039uze713lmqcbd	X7	cmep5rnkv002xuze7apiiuy8r	2025-08-24 03:58:27.808	2025-08-24 03:58:27.808
cmep5rple003buze7xdxgdf0z	7 Series	cmep5rnkv002xuze7apiiuy8r	2025-08-24 03:58:28.179	2025-08-24 03:58:28.179
cmep5rpvm003duze7eupssgw6	4 Series	cmep5rnkv002xuze7apiiuy8r	2025-08-24 03:58:28.546	2025-08-24 03:58:28.546
cmep5rq5y003fuze7lrrj6e1g	Z4	cmep5rnkv002xuze7apiiuy8r	2025-08-24 03:58:28.918	2025-08-24 03:58:28.918
cmep5rqgb003huze7ovczy6oz	i4	cmep5rnkv002xuze7apiiuy8r	2025-08-24 03:58:29.292	2025-08-24 03:58:29.292
cmep5rr16003kuze7sgcxvq31	C-Class	cmep5rqqq003iuze70r2lkd9o	2025-08-24 03:58:30.043	2025-08-24 03:58:30.043
cmep5rrdz003muze7irqp1eud	E-Class	cmep5rqqq003iuze70r2lkd9o	2025-08-24 03:58:30.503	2025-08-24 03:58:30.503
cmep5rrom003ouze7hi8zl93g	S-Class	cmep5rqqq003iuze70r2lkd9o	2025-08-24 03:58:30.887	2025-08-24 03:58:30.887
cmep5rryz003quze7fe3apzvp	GLC	cmep5rqqq003iuze70r2lkd9o	2025-08-24 03:58:31.26	2025-08-24 03:58:31.26
cmep5rs9c003suze7c09ryfia	GLE	cmep5rqqq003iuze70r2lkd9o	2025-08-24 03:58:31.632	2025-08-24 03:58:31.632
cmep5rsjn003uuze7f2j801ca	GLS	cmep5rqqq003iuze70r2lkd9o	2025-08-24 03:58:32.004	2025-08-24 03:58:32.004
cmep5rsu1003wuze7wy1xkena	A-Class	cmep5rqqq003iuze70r2lkd9o	2025-08-24 03:58:32.378	2025-08-24 03:58:32.378
cmep5rt4g003yuze7x8u33279	CLA	cmep5rqqq003iuze70r2lkd9o	2025-08-24 03:58:32.752	2025-08-24 03:58:32.752
cmep5rteq0040uze7g7bhu2og	GLA	cmep5rqqq003iuze70r2lkd9o	2025-08-24 03:58:33.122	2025-08-24 03:58:33.122
cmep5rtr30042uze76it0lmre	EQS	cmep5rqqq003iuze70r2lkd9o	2025-08-24 03:58:33.491	2025-08-24 03:58:33.491
cmep5rubs0045uze7kylcpu6a	A4	cmep5ru1i0043uze7bpfrye3o	2025-08-24 03:58:34.312	2025-08-24 03:58:34.312
cmep5rum60047uze7uqs5vtkx	A6	cmep5ru1i0043uze7bpfrye3o	2025-08-24 03:58:34.686	2025-08-24 03:58:34.686
cmep5ruwj0049uze7b1wum2u6	Q5	cmep5ru1i0043uze7bpfrye3o	2025-08-24 03:58:35.059	2025-08-24 03:58:35.059
cmep5rva8004buze7suibrlnk	Q7	cmep5ru1i0043uze7bpfrye3o	2025-08-24 03:58:35.552	2025-08-24 03:58:35.552
cmep5rvks004duze7fw53zbnt	A3	cmep5ru1i0043uze7bpfrye3o	2025-08-24 03:58:35.932	2025-08-24 03:58:35.932
cmep5rvv9004fuze7s3du8zmp	Q3	cmep5ru1i0043uze7bpfrye3o	2025-08-24 03:58:36.31	2025-08-24 03:58:36.31
cmep5rw5x004huze7mhnys8ib	A8	cmep5ru1i0043uze7bpfrye3o	2025-08-24 03:58:36.694	2025-08-24 03:58:36.694
cmep5rwgj004juze7geter73c	Q8	cmep5ru1i0043uze7bpfrye3o	2025-08-24 03:58:37.075	2025-08-24 03:58:37.075
cmep5rwr7004luze7due7ojlz	e-tron	cmep5ru1i0043uze7bpfrye3o	2025-08-24 03:58:37.459	2025-08-24 03:58:37.459
cmep5rx1t004nuze71z5kjmk5	A5	cmep5ru1i0043uze7bpfrye3o	2025-08-24 03:58:37.842	2025-08-24 03:58:37.842
cmep5rxmt004quze712i0egzb	ES	cmep5rxch004ouze7am9hntqx	2025-08-24 03:58:38.598	2025-08-24 03:58:38.598
cmep5rxxi004suze7nfnty8yc	RX	cmep5rxch004ouze7am9hntqx	2025-08-24 03:58:38.982	2025-08-24 03:58:38.982
cmep5ry81004uuze7ixls5z1n	NX	cmep5rxch004ouze7am9hntqx	2025-08-24 03:58:39.361	2025-08-24 03:58:39.361
cmep5ryim004wuze7klv1jai1	GX	cmep5rxch004ouze7am9hntqx	2025-08-24 03:58:39.743	2025-08-24 03:58:39.743
cmep5ryt1004yuze7f34q78f1	LX	cmep5rxch004ouze7am9hntqx	2025-08-24 03:58:40.117	2025-08-24 03:58:40.117
cmep5rz3l0050uze735irorxa	IS	cmep5rxch004ouze7am9hntqx	2025-08-24 03:58:40.497	2025-08-24 03:58:40.497
cmep5rze60052uze7h2gz3hva	LS	cmep5rxch004ouze7am9hntqx	2025-08-24 03:58:40.878	2025-08-24 03:58:40.878
cmep5rzoj0054uze7rqm4pw1r	UX	cmep5rxch004ouze7am9hntqx	2025-08-24 03:58:41.251	2025-08-24 03:58:41.251
cmep5rzyx0056uze7u6iwnojl	LC	cmep5rxch004ouze7am9hntqx	2025-08-24 03:58:41.625	2025-08-24 03:58:41.625
cmep5s09e0058uze7f6xy0xeg	RC	cmep5rxch004ouze7am9hntqx	2025-08-24 03:58:42.002	2025-08-24 03:58:42.002
cmep5s0ub005buze76091kuly	Elantra	cmep5s0jt0059uze74dq2c767	2025-08-24 03:58:42.756	2025-08-24 03:58:42.756
cmep5s14u005duze714b4te8z	Sonata	cmep5s0jt0059uze74dq2c767	2025-08-24 03:58:43.134	2025-08-24 03:58:43.134
cmep5s1i4005fuze7gt18c210	Tucson	cmep5s0jt0059uze74dq2c767	2025-08-24 03:58:43.612	2025-08-24 03:58:43.612
cmep5s1sg005huze70shi59sf	Santa Fe	cmep5s0jt0059uze74dq2c767	2025-08-24 03:58:43.984	2025-08-24 03:58:43.984
cmep5s22o005juze7on90f0l1	Palisade	cmep5s0jt0059uze74dq2c767	2025-08-24 03:58:44.352	2025-08-24 03:58:44.352
cmep5s2db005luze7fbmigxzp	Kona	cmep5s0jt0059uze74dq2c767	2025-08-24 03:58:44.735	2025-08-24 03:58:44.735
cmep5s2nr005nuze78qvyp1o4	Ioniq	cmep5s0jt0059uze74dq2c767	2025-08-24 03:58:45.112	2025-08-24 03:58:45.112
cmep5s2y3005puze7dv8jidbv	Genesis	cmep5s0jt0059uze74dq2c767	2025-08-24 03:58:45.484	2025-08-24 03:58:45.484
cmep5s38c005ruze7yejqjxyr	Accent	cmep5s0jt0059uze74dq2c767	2025-08-24 03:58:45.852	2025-08-24 03:58:45.852
cmep5s3im005tuze7zzymsjiu	Venue	cmep5s0jt0059uze74dq2c767	2025-08-24 03:58:46.222	2025-08-24 03:58:46.222
cmep5s439005wuze7kefej72c	Forte	cmep5s3st005uuze7ipvm0r42	2025-08-24 03:58:46.965	2025-08-24 03:58:46.965
cmep5s4dl005yuze79inbk9tu	Optima	cmep5s3st005uuze7ipvm0r42	2025-08-24 03:58:47.337	2025-08-24 03:58:47.337
cmep5s4nu0060uze78tl5xvzh	Sportage	cmep5s3st005uuze7ipvm0r42	2025-08-24 03:58:47.707	2025-08-24 03:58:47.707
cmep5s4y90062uze7sg7s2mbf	Sorento	cmep5s3st005uuze7ipvm0r42	2025-08-24 03:58:48.081	2025-08-24 03:58:48.081
cmep5s58n0064uze7cao7g2g6	Telluride	cmep5s3st005uuze7ipvm0r42	2025-08-24 03:58:48.455	2025-08-24 03:58:48.455
cmep5s5kz0066uze7v98geuey	Soul	cmep5s3st005uuze7ipvm0r42	2025-08-24 03:58:48.827	2025-08-24 03:58:48.827
cmep5s5v80068uze7l58x5llj	Stinger	cmep5s3st005uuze7ipvm0r42	2025-08-24 03:58:49.269	2025-08-24 03:58:49.269
cmep5s65n006auze7898cs9zb	Rio	cmep5s3st005uuze7ipvm0r42	2025-08-24 03:58:49.643	2025-08-24 03:58:49.643
cmep5s6fu006cuze7qwhy4t47	Niro	cmep5s3st005uuze7ipvm0r42	2025-08-24 03:58:50.011	2025-08-24 03:58:50.011
cmep5s6qf006euze7qharrrle	Carnival	cmep5s3st005uuze7ipvm0r42	2025-08-24 03:58:50.391	2025-08-24 03:58:50.391
cmep5s7ba006huze7goixjpky	Outback	cmep5s70p006fuze7mthpxldd	2025-08-24 03:58:51.142	2025-08-24 03:58:51.142
cmep5s7lq006juze783ohg9c8	Forester	cmep5s70p006fuze7mthpxldd	2025-08-24 03:58:51.518	2025-08-24 03:58:51.518
cmep5s7wb006luze7nq7l8vfz	Crosstrek	cmep5s70p006fuze7mthpxldd	2025-08-24 03:58:51.9	2025-08-24 03:58:51.9
cmep5s86n006nuze7gtjyocmi	Impreza	cmep5s70p006fuze7mthpxldd	2025-08-24 03:58:52.272	2025-08-24 03:58:52.272
cmep5s8gz006puze7za9m9hnp	Legacy	cmep5s70p006fuze7mthpxldd	2025-08-24 03:58:52.643	2025-08-24 03:58:52.643
cmep5s8rc006ruze76hb3xtp5	Ascent	cmep5s70p006fuze7mthpxldd	2025-08-24 03:58:53.017	2025-08-24 03:58:53.017
cmep5s92g006tuze7zo97wen8	WRX	cmep5s70p006fuze7mthpxldd	2025-08-24 03:58:53.416	2025-08-24 03:58:53.416
cmep5s9cr006vuze7ccww7b8g	BRZ	cmep5s70p006fuze7mthpxldd	2025-08-24 03:58:53.788	2025-08-24 03:58:53.788
cmep5s9n1006xuze7boeqksrb	Wilderness	cmep5s70p006fuze7mthpxldd	2025-08-24 03:58:54.158	2025-08-24 03:58:54.158
cmep5s9xf006zuze7zbgmuqr8	Solterra	cmep5s70p006fuze7mthpxldd	2025-08-24 03:58:54.531	2025-08-24 03:58:54.531
cmep5sahz0072uze79azyqvgx	Mazda3	cmep5sa7p0070uze7acxj33kh	2025-08-24 03:58:55.272	2025-08-24 03:58:55.272
cmep5sasd0074uze717e1cg99	Mazda6	cmep5sa7p0070uze7acxj33kh	2025-08-24 03:58:55.645	2025-08-24 03:58:55.645
cmep5sb2j0076uze75oo7hau3	CX-5	cmep5sa7p0070uze7acxj33kh	2025-08-24 03:58:56.012	2025-08-24 03:58:56.012
cmep5sbd30078uze705jawq3d	CX-9	cmep5sa7p0070uze7acxj33kh	2025-08-24 03:58:56.391	2025-08-24 03:58:56.391
cmep5sbsw007auze7ra1x13xc	CX-30	cmep5sa7p0070uze7acxj33kh	2025-08-24 03:58:56.96	2025-08-24 03:58:56.96
cmep5sc35007cuze7uty3lbze	MX-5 Miata	cmep5sa7p0070uze7acxj33kh	2025-08-24 03:58:57.33	2025-08-24 03:58:57.33
cmep5scdg007euze79j2b3uj9	CX-50	cmep5sa7p0070uze7acxj33kh	2025-08-24 03:58:57.7	2025-08-24 03:58:57.7
cmep5scnm007guze7o0f2a12e	Mazda2	cmep5sa7p0070uze7acxj33kh	2025-08-24 03:58:58.067	2025-08-24 03:58:58.067
cmep5scy0007iuze7748ib3by	CX-3	cmep5sa7p0070uze7acxj33kh	2025-08-24 03:58:58.44	2025-08-24 03:58:58.44
cmep5sdg8007kuze7lxr8vr3d	RX-8	cmep5sa7p0070uze7acxj33kh	2025-08-24 03:58:59.097	2025-08-24 03:58:59.097
cmep5se0w007nuze7g40krfmv	Jetta	cmep5sdqi007luze7jdysahhz	2025-08-24 03:58:59.84	2025-08-24 03:58:59.84
cmep5seb3007puze7b3gwctr1	Passat	cmep5sdqi007luze7jdysahhz	2025-08-24 03:59:00.208	2025-08-24 03:59:00.208
cmep5selb007ruze73kxsyd6w	Tiguan	cmep5sdqi007luze7jdysahhz	2025-08-24 03:59:00.575	2025-08-24 03:59:00.575
cmep5sevp007tuze79z3qbav5	Atlas	cmep5sdqi007luze7jdysahhz	2025-08-24 03:59:00.95	2025-08-24 03:59:00.95
cmep5sf63007vuze7z1zg4gc8	Golf	cmep5sdqi007luze7jdysahhz	2025-08-24 03:59:01.323	2025-08-24 03:59:01.323
cmep5sfgf007xuze7cnj1u4jp	Arteon	cmep5sdqi007luze7jdysahhz	2025-08-24 03:59:01.696	2025-08-24 03:59:01.696
cmep5sfqr007zuze7l039unme	ID.4	cmep5sdqi007luze7jdysahhz	2025-08-24 03:59:02.067	2025-08-24 03:59:02.067
cmep5sg100081uze7c0yz1teq	Taos	cmep5sdqi007luze7jdysahhz	2025-08-24 03:59:02.437	2025-08-24 03:59:02.437
cmep5sgb90083uze7l5q51mqj	Beetle	cmep5sdqi007luze7jdysahhz	2025-08-24 03:59:02.805	2025-08-24 03:59:02.805
cmep5sgll0085uze7aa28nzf1	CC	cmep5sdqi007luze7jdysahhz	2025-08-24 03:59:03.178	2025-08-24 03:59:03.178
cmep5sh950088uze7k92qxbyo	Wrangler	cmep5sgwm0086uze7je634m7n	2025-08-24 03:59:03.949	2025-08-24 03:59:03.949
cmep5shjl008auze7bpwoihrx	Grand Cherokee	cmep5sgwm0086uze7je634m7n	2025-08-24 03:59:04.402	2025-08-24 03:59:04.402
cmep5shtz008cuze73kqb7lvo	Cherokee	cmep5sgwm0086uze7je634m7n	2025-08-24 03:59:04.776	2025-08-24 03:59:04.776
cmep5si4e008euze7j510is2y	Compass	cmep5sgwm0086uze7je634m7n	2025-08-24 03:59:05.15	2025-08-24 03:59:05.15
cmep5sieo008guze7i20rjo46	Renegade	cmep5sgwm0086uze7je634m7n	2025-08-24 03:59:05.521	2025-08-24 03:59:05.521
cmep5sip1008iuze7jzcu805i	Gladiator	cmep5sgwm0086uze7je634m7n	2025-08-24 03:59:05.893	2025-08-24 03:59:05.893
cmep5sizh008kuze7hlirvg5k	Grand Wagoneer	cmep5sgwm0086uze7je634m7n	2025-08-24 03:59:06.27	2025-08-24 03:59:06.27
cmep5sj9s008muze7vh6ko93h	Wagoneer	cmep5sgwm0086uze7je634m7n	2025-08-24 03:59:06.641	2025-08-24 03:59:06.641
cmep5sjk9008ouze7seycz17c	Patriot	cmep5sgwm0086uze7je634m7n	2025-08-24 03:59:07.018	2025-08-24 03:59:07.018
cmep5sjuq008quze7467h0z9z	Liberty	cmep5sgwm0086uze7je634m7n	2025-08-24 03:59:07.394	2025-08-24 03:59:07.394
cmep5skfm008tuze7x3y7lexr	Model 3	cmep5sk56008ruze79ka68dpp	2025-08-24 03:59:08.147	2025-08-24 03:59:08.147
cmep5skqa008vuze7au5w1gtr	Model Y	cmep5sk56008ruze79ka68dpp	2025-08-24 03:59:08.531	2025-08-24 03:59:08.531
cmep5sl0u008xuze7ps0wzosw	Model S	cmep5sk56008ruze79ka68dpp	2025-08-24 03:59:08.91	2025-08-24 03:59:08.91
cmep5slb5008zuze7td0gkq8a	Model X	cmep5sk56008ruze79ka68dpp	2025-08-24 03:59:09.282	2025-08-24 03:59:09.282
cmep5sllp0091uze72deomdtl	Cybertruck	cmep5sk56008ruze79ka68dpp	2025-08-24 03:59:09.661	2025-08-24 03:59:09.661
cmep5slvz0093uze7rv6ra1wq	Roadster	cmep5sk56008ruze79ka68dpp	2025-08-24 03:59:10.031	2025-08-24 03:59:10.031
cmep5smgp0096uze7n2bnu1t6	1500	cmep5sm6b0094uze7yfuwi9r0	2025-08-24 03:59:10.777	2025-08-24 03:59:10.777
cmep5smr00098uze7q18tk00c	2500	cmep5sm6b0094uze7yfuwi9r0	2025-08-24 03:59:11.148	2025-08-24 03:59:11.148
cmep5sn1b009auze75pr4xlsv	3500	cmep5sm6b0094uze7yfuwi9r0	2025-08-24 03:59:11.52	2025-08-24 03:59:11.52
cmep5snbm009cuze7bsnr5lp6	ProMaster	cmep5sm6b0094uze7yfuwi9r0	2025-08-24 03:59:11.891	2025-08-24 03:59:11.891
cmep5snlx009euze7ia68r12e	ProMaster City	cmep5sm6b0094uze7yfuwi9r0	2025-08-24 03:59:12.261	2025-08-24 03:59:12.261
cmep5so6h009huze7ugd0oo0u	Sierra	cmep5snw3009fuze7zyi3oqb6	2025-08-24 03:59:13.001	2025-08-24 03:59:13.001
cmep5sogw009juze7tdcga9xt	Terrain	cmep5snw3009fuze7zyi3oqb6	2025-08-24 03:59:13.376	2025-08-24 03:59:13.376
cmep5sor4009luze7ye50at9t	Acadia	cmep5snw3009fuze7zyi3oqb6	2025-08-24 03:59:13.745	2025-08-24 03:59:13.745
cmep5sp1d009nuze7fg7ifoq1	Yukon	cmep5snw3009fuze7zyi3oqb6	2025-08-24 03:59:14.113	2025-08-24 03:59:14.113
cmep5spbt009puze7txbqfr3f	Canyon	cmep5snw3009fuze7zyi3oqb6	2025-08-24 03:59:14.489	2025-08-24 03:59:14.489
cmep5spm4009ruze7szta0sqc	Savana	cmep5snw3009fuze7zyi3oqb6	2025-08-24 03:59:14.861	2025-08-24 03:59:14.861
cmep5spwu009tuze7b9kwg1r4	Hummer EV	cmep5snw3009fuze7zyi3oqb6	2025-08-24 03:59:15.246	2025-08-24 03:59:15.246
cmep5sqhn009wuze7zq78c7e6	Escalade	cmep5sq7a009uuze7e9ftonra	2025-08-24 03:59:15.996	2025-08-24 03:59:15.996
cmep5sqrz009yuze7gjjywyah	XT5	cmep5sq7a009uuze7e9ftonra	2025-08-24 03:59:16.367	2025-08-24 03:59:16.367
cmep5sr3100a0uze7dbqccfv0	XT6	cmep5sq7a009uuze7e9ftonra	2025-08-24 03:59:16.765	2025-08-24 03:59:16.765
cmep5srdg00a2uze75eus0njz	CT4	cmep5sq7a009uuze7e9ftonra	2025-08-24 03:59:17.14	2025-08-24 03:59:17.14
cmep5srnu00a4uze7ti090rpt	CT5	cmep5sq7a009uuze7e9ftonra	2025-08-24 03:59:17.515	2025-08-24 03:59:17.515
cmep5sryc00a6uze7yt1fo64s	Lyriq	cmep5sq7a009uuze7e9ftonra	2025-08-24 03:59:17.893	2025-08-24 03:59:17.893
cmep5ss8s00a8uze7xtquon25	XT4	cmep5sq7a009uuze7e9ftonra	2025-08-24 03:59:18.269	2025-08-24 03:59:18.269
cmep5ssj900aauze79fpoyzf4	Celestiq	cmep5sq7a009uuze7e9ftonra	2025-08-24 03:59:18.645	2025-08-24 03:59:18.645
cmep5st6h00aduze72o8p2zra	Q50	cmep5ssvz00abuze7s28e2muh	2025-08-24 03:59:19.482	2025-08-24 03:59:19.482
cmep5stgx00afuze7k5i9qm01	Q60	cmep5ssvz00abuze7s28e2muh	2025-08-24 03:59:19.857	2025-08-24 03:59:19.857
cmep5strf00ahuze7dhx8l5vm	QX50	cmep5ssvz00abuze7s28e2muh	2025-08-24 03:59:20.235	2025-08-24 03:59:20.235
cmep5su1y00ajuze7te2q7mqd	QX60	cmep5ssvz00abuze7s28e2muh	2025-08-24 03:59:20.614	2025-08-24 03:59:20.614
cmep5sucp00aluze7bx6n6sza	QX80	cmep5ssvz00abuze7s28e2muh	2025-08-24 03:59:21.001	2025-08-24 03:59:21.001
cmep5sun200anuze7p01489si	Q70	cmep5ssvz00abuze7s28e2muh	2025-08-24 03:59:21.374	2025-08-24 03:59:21.374
cmep5suxv00apuze7j86upxl3	QX30	cmep5ssvz00abuze7s28e2muh	2025-08-24 03:59:21.764	2025-08-24 03:59:21.764
cmep5sv8b00aruze799n6fdo9	Q30	cmep5ssvz00abuze7s28e2muh	2025-08-24 03:59:22.14	2025-08-24 03:59:22.14
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, name, image, "emailVerified", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: verificationtokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.verificationtokens (identifier, token, expires) FROM stdin;
\.


--
-- Name: users_sync users_sync_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neondb_owner
--

ALTER TABLE ONLY neon_auth.users_sync
    ADD CONSTRAINT users_sync_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: car_deals car_deals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_deals
    ADD CONSTRAINT car_deals_pkey PRIMARY KEY (id);


--
-- Name: car_makes car_makes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_makes
    ADD CONSTRAINT car_makes_pkey PRIMARY KEY (id);


--
-- Name: car_models car_models_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_models
    ADD CONSTRAINT car_models_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_sync_deleted_at_idx; Type: INDEX; Schema: neon_auth; Owner: neondb_owner
--

CREATE INDEX users_sync_deleted_at_idx ON neon_auth.users_sync USING btree (deleted_at);


--
-- Name: accounts_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");


--
-- Name: car_makes_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX car_makes_name_key ON public.car_makes USING btree (name);


--
-- Name: car_models_name_makeId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "car_models_name_makeId_key" ON public.car_models USING btree (name, "makeId");


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: verificationtokens_identifier_token_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX verificationtokens_identifier_token_key ON public.verificationtokens USING btree (identifier, token);


--
-- Name: verificationtokens_token_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX verificationtokens_token_key ON public.verificationtokens USING btree (token);


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: car_deals car_deals_makeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_deals
    ADD CONSTRAINT "car_deals_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES public.car_makes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: car_deals car_deals_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_deals
    ADD CONSTRAINT "car_deals_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public.car_models(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: car_deals car_deals_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_deals
    ADD CONSTRAINT "car_deals_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: car_models car_models_makeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_models
    ADD CONSTRAINT "car_models_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES public.car_makes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict esC6cyfffqsQyeomg7wIzJM6odug4L1PgJ4gG39snuKAqbyvdHtsec6v5PqlaEu


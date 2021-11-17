SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ff_auto_navigated_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ff_auto_navigated_status AS ENUM (
    'NONE',
    'IN_STORAGE',
    'COMPLETELY_IN_STORAGE',
    'IN_WAREHOUSE',
    'COMPLETELY_IN_WAREHOUSE'
);


--
-- Name: ff_barcode_element; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ff_barcode_element AS ENUM (
    'DUCK',
    'TEAM_SHIPPING_ELEMENT'
);


--
-- Name: ff_endgame_parked_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ff_endgame_parked_status AS ENUM (
    'NONE',
    'IN_WAREHOUSE',
    'COMPLETELY_IN_WAREHOUSE'
);


--
-- Name: delayed_jobs_after_delete_row_tr_fn(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delayed_jobs_after_delete_row_tr_fn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      DECLARE
        running_count integer;
      BEGIN
        IF OLD.strand IS NOT NULL THEN
          PERFORM pg_advisory_xact_lock(half_md5_as_bigint(OLD.strand));
          running_count := (SELECT COUNT(*) FROM delayed_jobs WHERE strand = OLD.strand AND next_in_strand = 't');
          IF running_count < OLD.max_concurrent THEN
            UPDATE delayed_jobs SET next_in_strand = 't' WHERE id IN (
              SELECT id FROM delayed_jobs j2 WHERE next_in_strand = 'f' AND
              j2.strand = OLD.strand ORDER BY j2.id ASC LIMIT (OLD.max_concurrent - running_count) FOR UPDATE
            );
          END IF;
        END IF;
        RETURN OLD;
      END;
      $$;


--
-- Name: delayed_jobs_before_insert_row_tr_fn(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delayed_jobs_before_insert_row_tr_fn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW.strand IS NOT NULL THEN
          PERFORM pg_advisory_xact_lock(half_md5_as_bigint(NEW.strand));
          IF (SELECT COUNT(*) FROM delayed_jobs WHERE strand = NEW.strand) >= NEW.max_concurrent THEN
            NEW.next_in_strand := 'f';
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$;


--
-- Name: half_md5_as_bigint(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.half_md5_as_bigint(strand character varying) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
      DECLARE
        strand_md5 bytea;
      BEGIN
        strand_md5 := decode(md5(strand), 'hex');
        RETURN (CAST(get_byte(strand_md5, 0) AS bigint) << 56) +
                                  (CAST(get_byte(strand_md5, 1) AS bigint) << 48) +
                                  (CAST(get_byte(strand_md5, 2) AS bigint) << 40) +
                                  (CAST(get_byte(strand_md5, 3) AS bigint) << 32) +
                                  (CAST(get_byte(strand_md5, 4) AS bigint) << 24) +
                                  (get_byte(strand_md5, 5) << 16) +
                                  (get_byte(strand_md5, 6) << 8) +
                                   get_byte(strand_md5, 7);
      END;
      $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: access_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.access_requests (
    id bigint NOT NULL,
    user_id bigint,
    event_id bigint,
    message character varying,
    access_token character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: access_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.access_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: access_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.access_requests_id_seq OWNED BY public.access_requests.id;


--
-- Name: active_storage_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_storage_attachments (
    id bigint NOT NULL,
    name character varying NOT NULL,
    record_type character varying NOT NULL,
    record_id bigint NOT NULL,
    blob_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_storage_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_storage_attachments_id_seq OWNED BY public.active_storage_attachments.id;


--
-- Name: active_storage_blobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_storage_blobs (
    id bigint NOT NULL,
    key character varying NOT NULL,
    filename character varying NOT NULL,
    content_type character varying,
    metadata text,
    byte_size bigint NOT NULL,
    checksum character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_storage_blobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_storage_blobs_id_seq OWNED BY public.active_storage_blobs.id;


--
-- Name: alliance_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alliance_teams (
    team_id bigint NOT NULL,
    alliance_id bigint NOT NULL,
    id bigint NOT NULL,
    "position" integer
);


--
-- Name: alliance_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alliance_teams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alliance_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alliance_teams_id_seq OWNED BY public.alliance_teams.id;


--
-- Name: alliances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alliances (
    id bigint NOT NULL,
    event_id bigint,
    is_elims boolean,
    seed integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    event_division_id bigint
);


--
-- Name: alliances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alliances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alliances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alliances_id_seq OWNED BY public.alliances.id;


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: award_finalists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.award_finalists (
    id bigint NOT NULL,
    award_id bigint,
    team_id bigint,
    recipient character varying,
    place integer,
    description text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: award_finalists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.award_finalists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: award_finalists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.award_finalists_id_seq OWNED BY public.award_finalists.id;


--
-- Name: awards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.awards (
    id bigint NOT NULL,
    name character varying,
    description text,
    event_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: awards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.awards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: awards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.awards_id_seq OWNED BY public.awards.id;


--
-- Name: delayed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delayed_jobs (
    id integer NOT NULL,
    priority integer DEFAULT 0,
    attempts integer DEFAULT 0,
    handler text,
    last_error text,
    queue character varying(255),
    run_at timestamp without time zone,
    locked_at timestamp without time zone,
    failed_at timestamp without time zone,
    locked_by character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    tag character varying(255),
    max_attempts integer,
    strand character varying(255),
    next_in_strand boolean DEFAULT true NOT NULL,
    source character varying(255),
    max_concurrent integer DEFAULT 1 NOT NULL,
    expires_at timestamp without time zone
);


--
-- Name: delayed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delayed_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: delayed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.delayed_jobs_id_seq OWNED BY public.delayed_jobs.id;


--
-- Name: divisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisions (
    id bigint NOT NULL,
    name character varying,
    league_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    slug character varying,
    divisions_teams_count integer
);


--
-- Name: divisions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.divisions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: divisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.divisions_id_seq OWNED BY public.divisions.id;


--
-- Name: divisions_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisions_teams (
    team_id bigint NOT NULL,
    division_id bigint NOT NULL,
    id bigint NOT NULL
);


--
-- Name: divisions_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.divisions_teams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: divisions_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.divisions_teams_id_seq OWNED BY public.divisions_teams.id;


--
-- Name: event_channel_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_channel_assignments (
    id bigint NOT NULL,
    event_id bigint,
    twitch_channel_id bigint,
    start_date date,
    end_date date,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    aasm_state character varying,
    user_id bigint
);


--
-- Name: event_channel_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_channel_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_channel_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_channel_assignments_id_seq OWNED BY public.event_channel_assignments.id;


--
-- Name: event_divisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_divisions (
    id bigint NOT NULL,
    event_id bigint,
    number integer,
    name character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: event_divisions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_divisions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_divisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_divisions_id_seq OWNED BY public.event_divisions.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id bigint NOT NULL,
    name character varying,
    start_date date,
    end_date date,
    location character varying,
    city character varying,
    state character varying,
    country character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    season_id bigint,
    context_type character varying,
    context_id bigint,
    aasm_state character varying,
    slug character varying,
    address character varying,
    remote boolean DEFAULT false NOT NULL,
    type integer
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: events_sponsors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_sponsors (
    sponsor_id bigint NOT NULL,
    event_id bigint NOT NULL,
    id bigint NOT NULL
);


--
-- Name: events_sponsors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_sponsors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_sponsors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_sponsors_id_seq OWNED BY public.events_sponsors.id;


--
-- Name: events_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_teams (
    team_id bigint NOT NULL,
    event_id bigint NOT NULL,
    event_division_id bigint,
    id bigint NOT NULL
);


--
-- Name: events_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_teams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_teams_id_seq OWNED BY public.events_teams.id;


--
-- Name: events_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_users (
    event_id bigint NOT NULL,
    user_id bigint NOT NULL
);


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id integer NOT NULL,
    priority integer DEFAULT 0,
    attempts integer DEFAULT 0,
    handler character varying(512000),
    last_error text,
    queue character varying(255),
    run_at timestamp without time zone,
    locked_at timestamp without time zone,
    failed_at timestamp without time zone,
    locked_by character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    tag character varying(255),
    max_attempts integer,
    strand character varying(255),
    original_job_id bigint,
    source character varying(255),
    expires_at timestamp without time zone
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: freight_frenzy_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.freight_frenzy_scores (
    id bigint NOT NULL,
    barcode_element1 public.ff_barcode_element DEFAULT 'DUCK'::public.ff_barcode_element,
    barcode_element2 public.ff_barcode_element DEFAULT 'DUCK'::public.ff_barcode_element,
    carousel boolean DEFAULT false,
    auto_navigated1 public.ff_auto_navigated_status DEFAULT 'NONE'::public.ff_auto_navigated_status,
    auto_navigated2 public.ff_auto_navigated_status DEFAULT 'NONE'::public.ff_auto_navigated_status,
    auto_bonus1 boolean DEFAULT false,
    auto_bonus2 boolean DEFAULT false,
    auto_storage_freight integer DEFAULT 0,
    auto_freight1 integer DEFAULT 0,
    auto_freight2 integer DEFAULT 0,
    auto_freight3 integer DEFAULT 0,
    teleop_storage_freight integer DEFAULT 0,
    teleop_freight1 integer DEFAULT 0,
    teleop_freight2 integer DEFAULT 0,
    teleop_freight3 integer DEFAULT 0,
    shared_freight integer DEFAULT 0,
    end_delivered integer DEFAULT 0,
    alliance_balanced boolean DEFAULT false,
    shared_unbalanced boolean DEFAULT false,
    end_parked1 public.ff_endgame_parked_status DEFAULT 'NONE'::public.ff_endgame_parked_status,
    end_parked2 public.ff_endgame_parked_status DEFAULT 'NONE'::public.ff_endgame_parked_status,
    capped integer DEFAULT 0,
    minor_penalties integer DEFAULT 0,
    major_penalties integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: freight_frenzy_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.freight_frenzy_scores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: freight_frenzy_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.freight_frenzy_scores_id_seq OWNED BY public.freight_frenzy_scores.id;


--
-- Name: freight_frenzy_scores_remote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.freight_frenzy_scores_remote (
    id bigint NOT NULL,
    barcode_element public.ff_barcode_element DEFAULT 'DUCK'::public.ff_barcode_element,
    carousel boolean DEFAULT false,
    auto_navigated public.ff_auto_navigated_status DEFAULT 'NONE'::public.ff_auto_navigated_status,
    auto_bonus boolean DEFAULT false,
    auto_storage_freight integer DEFAULT 0,
    auto_freight1 integer DEFAULT 0,
    auto_freight2 integer DEFAULT 0,
    auto_freight3 integer DEFAULT 0,
    teleop_storage_freight integer DEFAULT 0,
    teleop_freight1 integer DEFAULT 0,
    teleop_freight2 integer DEFAULT 0,
    teleop_freight3 integer DEFAULT 0,
    end_delivered integer DEFAULT 0,
    alliance_balanced boolean DEFAULT false,
    end_parked public.ff_endgame_parked_status DEFAULT 'NONE'::public.ff_endgame_parked_status,
    capped integer DEFAULT 0,
    minor_penalties integer DEFAULT 0,
    major_penalties integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: freight_frenzy_scores_remote_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.freight_frenzy_scores_remote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: freight_frenzy_scores_remote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.freight_frenzy_scores_remote_id_seq OWNED BY public.freight_frenzy_scores_remote.id;


--
-- Name: leagues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leagues (
    id bigint NOT NULL,
    name character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    season_id bigint,
    slug character varying,
    leagues_teams_count integer,
    league_id bigint
);


--
-- Name: leagues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leagues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leagues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leagues_id_seq OWNED BY public.leagues.id;


--
-- Name: leagues_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leagues_teams (
    team_id bigint NOT NULL,
    league_id bigint NOT NULL,
    id bigint NOT NULL
);


--
-- Name: leagues_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leagues_teams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leagues_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leagues_teams_id_seq OWNED BY public.leagues_teams.id;


--
-- Name: match_alliances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_alliances (
    id bigint NOT NULL,
    alliance_id bigint,
    surrogate json,
    teams_present json,
    red_card json,
    yellow_card json,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    rp json,
    tbp json,
    score json
);


--
-- Name: match_alliances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.match_alliances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: match_alliances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.match_alliances_id_seq OWNED BY public.match_alliances.id;


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matches (
    id bigint NOT NULL,
    phase integer,
    series integer,
    number integer,
    red_alliance_id bigint,
    blue_alliance_id bigint,
    red_score_id bigint,
    blue_score_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    event_id bigint,
    played boolean,
    event_division_id bigint
);


--
-- Name: matches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.matches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.matches_id_seq OWNED BY public.matches.id;


--
-- Name: rankings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rankings (
    id bigint NOT NULL,
    team_id bigint,
    ranking integer,
    sort_order1 double precision,
    sort_order2 double precision,
    matches_played integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    event_division_id bigint,
    context_type character varying NOT NULL,
    context_id bigint NOT NULL,
    sort_order3 double precision,
    sort_order4 double precision,
    sort_order5 double precision,
    sort_order6 double precision,
    matches_counted integer,
    wins integer,
    losses integer,
    ties integer
);


--
-- Name: rankings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rankings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rankings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rankings_id_seq OWNED BY public.rankings.id;


--
-- Name: rover_ruckus_cri_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rover_ruckus_cri_scores (
    id bigint NOT NULL,
    robots_landed integer DEFAULT 0,
    depots_claimed integer DEFAULT 0,
    robots_parked_auto integer DEFAULT 0,
    fields_sampled integer DEFAULT 0,
    depot_minerals integer DEFAULT 0,
    depot_platinum_minerals integer DEFAULT 0,
    gold_cargo integer DEFAULT 0,
    silver_cargo integer DEFAULT 0,
    any_cargo integer DEFAULT 0,
    platinum_cargo integer DEFAULT 0,
    latched_robots integer DEFAULT 0,
    any_latched_robots integer DEFAULT 0,
    robots_in_crater integer DEFAULT 0,
    robots_completely_in_crater integer DEFAULT 0,
    minor_penalties integer DEFAULT 0,
    major_penalties integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: rover_ruckus_cri_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rover_ruckus_cri_scores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rover_ruckus_cri_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rover_ruckus_cri_scores_id_seq OWNED BY public.rover_ruckus_cri_scores.id;


--
-- Name: rover_ruckus_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rover_ruckus_scores (
    id bigint NOT NULL,
    robots_landed integer DEFAULT 0,
    depots_claimed integer DEFAULT 0,
    robots_parked_auto integer DEFAULT 0,
    fields_sampled integer DEFAULT 0,
    depot_minerals integer DEFAULT 0,
    gold_cargo integer DEFAULT 0,
    silver_cargo integer DEFAULT 0,
    latched_robots integer DEFAULT 0,
    robots_in_crater integer DEFAULT 0,
    robots_completely_in_crater integer DEFAULT 0,
    minor_penalties integer DEFAULT 0,
    major_penalties integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: rover_ruckus_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rover_ruckus_scores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rover_ruckus_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rover_ruckus_scores_id_seq OWNED BY public.rover_ruckus_scores.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scores (
    id bigint NOT NULL,
    season_score_type character varying,
    season_score_id bigint,
    auto integer,
    teleop integer,
    endgame integer,
    penalty integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: scores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.scores_id_seq OWNED BY public.scores.id;


--
-- Name: seasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seasons (
    id bigint NOT NULL,
    year character varying,
    name character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    active boolean,
    offseason boolean,
    score_model_name character varying,
    scoring_version_constraint character varying,
    ranking_algorithm integer
);


--
-- Name: seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seasons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seasons_id_seq OWNED BY public.seasons.id;


--
-- Name: skystone_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skystone_scores (
    id bigint NOT NULL,
    auto_skystones integer DEFAULT 0,
    auto_delivered integer DEFAULT 0,
    auto_placed integer DEFAULT 0,
    robots_navigated integer DEFAULT 0,
    foundation_repositioned integer DEFAULT 0,
    teleop_placed integer DEFAULT 0,
    teleop_delivered integer DEFAULT 0,
    tallest_height integer DEFAULT 0,
    foundation_moved integer DEFAULT 0,
    robots_parked integer DEFAULT 0,
    capstone_1_level integer DEFAULT '-1'::integer,
    capstone_2_level integer DEFAULT '-1'::integer,
    minor_penalties integer DEFAULT 0,
    major_penalties integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: skystone_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skystone_scores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skystone_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skystone_scores_id_seq OWNED BY public.skystone_scores.id;


--
-- Name: sponsors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsors (
    id bigint NOT NULL,
    name character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    global boolean
);


--
-- Name: sponsors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sponsors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sponsors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sponsors_id_seq OWNED BY public.sponsors.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    number bigint NOT NULL,
    name character varying,
    organization character varying,
    city character varying,
    state character varying,
    country character varying,
    rookie_year character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    consent_missing boolean
);


--
-- Name: teams_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teams_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teams_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teams_number_seq OWNED BY public.teams.number;


--
-- Name: twitch_channels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.twitch_channels (
    id bigint NOT NULL,
    name character varying,
    access_token character varying,
    refresh_token character varying,
    expires_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    unmanaged boolean DEFAULT false NOT NULL
);


--
-- Name: twitch_channels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.twitch_channels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: twitch_channels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.twitch_channels_id_seq OWNED BY public.twitch_channels.id;


--
-- Name: ultimate_goal_scores_remote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ultimate_goal_scores_remote (
    id bigint NOT NULL,
    wobble_1_delivered boolean DEFAULT false,
    wobble_2_delivered boolean DEFAULT false,
    auto_tower_high integer DEFAULT 0,
    auto_tower_mid integer DEFAULT 0,
    auto_tower_low integer DEFAULT 0,
    auto_power_shot_left boolean DEFAULT false,
    auto_power_shot_center boolean DEFAULT false,
    auto_power_shot_right boolean DEFAULT false,
    navigated boolean DEFAULT false,
    teleop_tower_high integer DEFAULT 0,
    teleop_tower_mid integer DEFAULT 0,
    teleop_tower_low integer DEFAULT 0,
    teleop_power_shot_left boolean DEFAULT false,
    teleop_power_shot_center boolean DEFAULT false,
    teleop_power_shot_right boolean DEFAULT false,
    wobble_1_rings integer DEFAULT 0,
    wobble_2_rings integer DEFAULT 0,
    wobble_1_end integer DEFAULT 0,
    wobble_2_end integer DEFAULT 0,
    minor_penalties integer DEFAULT 0,
    major_penalties integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: ultimate_goal_scores_remote_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ultimate_goal_scores_remote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ultimate_goal_scores_remote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ultimate_goal_scores_remote_id_seq OWNED BY public.ultimate_goal_scores_remote.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    provider character varying DEFAULT 'email'::character varying NOT NULL,
    uid character varying DEFAULT ''::character varying NOT NULL,
    encrypted_password character varying DEFAULT ''::character varying NOT NULL,
    reset_password_token character varying,
    reset_password_sent_at timestamp without time zone,
    allow_password_change boolean DEFAULT false,
    remember_created_at timestamp without time zone,
    sign_in_count integer DEFAULT 0 NOT NULL,
    current_sign_in_at timestamp without time zone,
    last_sign_in_at timestamp without time zone,
    current_sign_in_ip character varying,
    last_sign_in_ip character varying,
    confirmation_token character varying,
    confirmed_at timestamp without time zone,
    confirmation_sent_at timestamp without time zone,
    unconfirmed_email character varying,
    name character varying,
    nickname character varying,
    image character varying,
    email character varying,
    tokens text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    role integer,
    invitation_token character varying,
    invitation_created_at timestamp without time zone,
    invitation_sent_at timestamp without time zone,
    invitation_accepted_at timestamp without time zone,
    invitation_limit integer,
    invited_by_type character varying,
    invited_by_id bigint,
    invitations_count integer DEFAULT 0
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: access_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_requests ALTER COLUMN id SET DEFAULT nextval('public.access_requests_id_seq'::regclass);


--
-- Name: active_storage_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments ALTER COLUMN id SET DEFAULT nextval('public.active_storage_attachments_id_seq'::regclass);


--
-- Name: active_storage_blobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_blobs ALTER COLUMN id SET DEFAULT nextval('public.active_storage_blobs_id_seq'::regclass);


--
-- Name: alliance_teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alliance_teams ALTER COLUMN id SET DEFAULT nextval('public.alliance_teams_id_seq'::regclass);


--
-- Name: alliances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alliances ALTER COLUMN id SET DEFAULT nextval('public.alliances_id_seq'::regclass);


--
-- Name: award_finalists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.award_finalists ALTER COLUMN id SET DEFAULT nextval('public.award_finalists_id_seq'::regclass);


--
-- Name: awards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.awards ALTER COLUMN id SET DEFAULT nextval('public.awards_id_seq'::regclass);


--
-- Name: delayed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delayed_jobs ALTER COLUMN id SET DEFAULT nextval('public.delayed_jobs_id_seq'::regclass);


--
-- Name: divisions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions ALTER COLUMN id SET DEFAULT nextval('public.divisions_id_seq'::regclass);


--
-- Name: divisions_teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions_teams ALTER COLUMN id SET DEFAULT nextval('public.divisions_teams_id_seq'::regclass);


--
-- Name: event_channel_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_channel_assignments ALTER COLUMN id SET DEFAULT nextval('public.event_channel_assignments_id_seq'::regclass);


--
-- Name: event_divisions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_divisions ALTER COLUMN id SET DEFAULT nextval('public.event_divisions_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: events_sponsors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_sponsors ALTER COLUMN id SET DEFAULT nextval('public.events_sponsors_id_seq'::regclass);


--
-- Name: events_teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_teams ALTER COLUMN id SET DEFAULT nextval('public.events_teams_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: freight_frenzy_scores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_frenzy_scores ALTER COLUMN id SET DEFAULT nextval('public.freight_frenzy_scores_id_seq'::regclass);


--
-- Name: freight_frenzy_scores_remote id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_frenzy_scores_remote ALTER COLUMN id SET DEFAULT nextval('public.freight_frenzy_scores_remote_id_seq'::regclass);


--
-- Name: leagues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues ALTER COLUMN id SET DEFAULT nextval('public.leagues_id_seq'::regclass);


--
-- Name: leagues_teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues_teams ALTER COLUMN id SET DEFAULT nextval('public.leagues_teams_id_seq'::regclass);


--
-- Name: match_alliances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_alliances ALTER COLUMN id SET DEFAULT nextval('public.match_alliances_id_seq'::regclass);


--
-- Name: matches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches ALTER COLUMN id SET DEFAULT nextval('public.matches_id_seq'::regclass);


--
-- Name: rankings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rankings ALTER COLUMN id SET DEFAULT nextval('public.rankings_id_seq'::regclass);


--
-- Name: rover_ruckus_cri_scores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rover_ruckus_cri_scores ALTER COLUMN id SET DEFAULT nextval('public.rover_ruckus_cri_scores_id_seq'::regclass);


--
-- Name: rover_ruckus_scores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rover_ruckus_scores ALTER COLUMN id SET DEFAULT nextval('public.rover_ruckus_scores_id_seq'::regclass);


--
-- Name: scores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scores ALTER COLUMN id SET DEFAULT nextval('public.scores_id_seq'::regclass);


--
-- Name: seasons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons ALTER COLUMN id SET DEFAULT nextval('public.seasons_id_seq'::regclass);


--
-- Name: skystone_scores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skystone_scores ALTER COLUMN id SET DEFAULT nextval('public.skystone_scores_id_seq'::regclass);


--
-- Name: sponsors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors ALTER COLUMN id SET DEFAULT nextval('public.sponsors_id_seq'::regclass);


--
-- Name: teams number; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams ALTER COLUMN number SET DEFAULT nextval('public.teams_number_seq'::regclass);


--
-- Name: twitch_channels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.twitch_channels ALTER COLUMN id SET DEFAULT nextval('public.twitch_channels_id_seq'::regclass);


--
-- Name: ultimate_goal_scores_remote id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ultimate_goal_scores_remote ALTER COLUMN id SET DEFAULT nextval('public.ultimate_goal_scores_remote_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: access_requests access_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_requests
    ADD CONSTRAINT access_requests_pkey PRIMARY KEY (id);


--
-- Name: active_storage_attachments active_storage_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT active_storage_attachments_pkey PRIMARY KEY (id);


--
-- Name: active_storage_blobs active_storage_blobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_blobs
    ADD CONSTRAINT active_storage_blobs_pkey PRIMARY KEY (id);


--
-- Name: alliance_teams alliance_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alliance_teams
    ADD CONSTRAINT alliance_teams_pkey PRIMARY KEY (id);


--
-- Name: alliances alliances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alliances
    ADD CONSTRAINT alliances_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: award_finalists award_finalists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.award_finalists
    ADD CONSTRAINT award_finalists_pkey PRIMARY KEY (id);


--
-- Name: awards awards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.awards
    ADD CONSTRAINT awards_pkey PRIMARY KEY (id);


--
-- Name: delayed_jobs delayed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delayed_jobs
    ADD CONSTRAINT delayed_jobs_pkey PRIMARY KEY (id);


--
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (id);


--
-- Name: divisions_teams divisions_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions_teams
    ADD CONSTRAINT divisions_teams_pkey PRIMARY KEY (id);


--
-- Name: event_channel_assignments event_channel_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_channel_assignments
    ADD CONSTRAINT event_channel_assignments_pkey PRIMARY KEY (id);


--
-- Name: event_divisions event_divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_divisions
    ADD CONSTRAINT event_divisions_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events_sponsors events_sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_sponsors
    ADD CONSTRAINT events_sponsors_pkey PRIMARY KEY (id);


--
-- Name: events_teams events_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_teams
    ADD CONSTRAINT events_teams_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: freight_frenzy_scores freight_frenzy_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_frenzy_scores
    ADD CONSTRAINT freight_frenzy_scores_pkey PRIMARY KEY (id);


--
-- Name: freight_frenzy_scores_remote freight_frenzy_scores_remote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freight_frenzy_scores_remote
    ADD CONSTRAINT freight_frenzy_scores_remote_pkey PRIMARY KEY (id);


--
-- Name: leagues leagues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT leagues_pkey PRIMARY KEY (id);


--
-- Name: leagues_teams leagues_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues_teams
    ADD CONSTRAINT leagues_teams_pkey PRIMARY KEY (id);


--
-- Name: match_alliances match_alliances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_alliances
    ADD CONSTRAINT match_alliances_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: rankings rankings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rankings
    ADD CONSTRAINT rankings_pkey PRIMARY KEY (id);


--
-- Name: rover_ruckus_cri_scores rover_ruckus_cri_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rover_ruckus_cri_scores
    ADD CONSTRAINT rover_ruckus_cri_scores_pkey PRIMARY KEY (id);


--
-- Name: rover_ruckus_scores rover_ruckus_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rover_ruckus_scores
    ADD CONSTRAINT rover_ruckus_scores_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: scores scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_pkey PRIMARY KEY (id);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: skystone_scores skystone_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skystone_scores
    ADD CONSTRAINT skystone_scores_pkey PRIMARY KEY (id);


--
-- Name: sponsors sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (number);


--
-- Name: twitch_channels twitch_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.twitch_channels
    ADD CONSTRAINT twitch_channels_pkey PRIMARY KEY (id);


--
-- Name: ultimate_goal_scores_remote ultimate_goal_scores_remote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ultimate_goal_scores_remote
    ADD CONSTRAINT ultimate_goal_scores_remote_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: get_delayed_jobs_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX get_delayed_jobs_index ON public.delayed_jobs USING btree (priority, run_at, queue) WHERE ((locked_at IS NULL) AND (next_in_strand = true));


--
-- Name: index_access_requests_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_access_requests_on_event_id ON public.access_requests USING btree (event_id);


--
-- Name: index_access_requests_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_access_requests_on_user_id ON public.access_requests USING btree (user_id);


--
-- Name: index_active_storage_attachments_on_blob_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_active_storage_attachments_on_blob_id ON public.active_storage_attachments USING btree (blob_id);


--
-- Name: index_active_storage_attachments_uniqueness; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_attachments_uniqueness ON public.active_storage_attachments USING btree (record_type, record_id, name, blob_id);


--
-- Name: index_active_storage_blobs_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_blobs_on_key ON public.active_storage_blobs USING btree (key);


--
-- Name: index_alliance_teams_on_alliance_id_and_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_alliance_teams_on_alliance_id_and_team_id ON public.alliance_teams USING btree (alliance_id, team_id);


--
-- Name: index_alliance_teams_on_team_id_and_alliance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_alliance_teams_on_team_id_and_alliance_id ON public.alliance_teams USING btree (team_id, alliance_id);


--
-- Name: index_alliances_on_event_division_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_alliances_on_event_division_id ON public.alliances USING btree (event_division_id);


--
-- Name: index_alliances_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_alliances_on_event_id ON public.alliances USING btree (event_id);


--
-- Name: index_award_finalists_on_award_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_award_finalists_on_award_id ON public.award_finalists USING btree (award_id);


--
-- Name: index_award_finalists_on_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_award_finalists_on_team_id ON public.award_finalists USING btree (team_id);


--
-- Name: index_awards_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_awards_on_event_id ON public.awards USING btree (event_id);


--
-- Name: index_delayed_jobs_on_locked_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_delayed_jobs_on_locked_by ON public.delayed_jobs USING btree (locked_by) WHERE (locked_by IS NOT NULL);


--
-- Name: index_delayed_jobs_on_run_at_and_tag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_delayed_jobs_on_run_at_and_tag ON public.delayed_jobs USING btree (run_at, tag);


--
-- Name: index_delayed_jobs_on_strand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_delayed_jobs_on_strand ON public.delayed_jobs USING btree (strand, id);


--
-- Name: index_delayed_jobs_on_tag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_delayed_jobs_on_tag ON public.delayed_jobs USING btree (tag);


--
-- Name: index_divisions_on_league_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_divisions_on_league_id ON public.divisions USING btree (league_id);


--
-- Name: index_divisions_teams_on_division_id_and_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_divisions_teams_on_division_id_and_team_id ON public.divisions_teams USING btree (division_id, team_id);


--
-- Name: index_divisions_teams_on_team_id_and_division_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_divisions_teams_on_team_id_and_division_id ON public.divisions_teams USING btree (team_id, division_id);


--
-- Name: index_event_channel_assignments_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_event_channel_assignments_on_event_id ON public.event_channel_assignments USING btree (event_id);


--
-- Name: index_event_channel_assignments_on_twitch_channel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_event_channel_assignments_on_twitch_channel_id ON public.event_channel_assignments USING btree (twitch_channel_id);


--
-- Name: index_event_channel_assignments_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_event_channel_assignments_on_user_id ON public.event_channel_assignments USING btree (user_id);


--
-- Name: index_event_divisions_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_event_divisions_on_event_id ON public.event_divisions USING btree (event_id);


--
-- Name: index_events_on_context_type_and_context_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_context_type_and_context_id ON public.events USING btree (context_type, context_id);


--
-- Name: index_events_on_season_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_season_id ON public.events USING btree (season_id);


--
-- Name: index_events_sponsors_on_event_id_and_sponsor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_sponsors_on_event_id_and_sponsor_id ON public.events_sponsors USING btree (event_id, sponsor_id);


--
-- Name: index_events_sponsors_on_sponsor_id_and_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_sponsors_on_sponsor_id_and_event_id ON public.events_sponsors USING btree (sponsor_id, event_id);


--
-- Name: index_events_teams_on_event_division_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_teams_on_event_division_id ON public.events_teams USING btree (event_division_id);


--
-- Name: index_events_teams_on_event_id_and_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_teams_on_event_id_and_team_id ON public.events_teams USING btree (event_id, team_id);


--
-- Name: index_events_teams_on_team_id_and_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_teams_on_team_id_and_event_id ON public.events_teams USING btree (team_id, event_id);


--
-- Name: index_events_users_on_event_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_users_on_event_id_and_user_id ON public.events_users USING btree (event_id, user_id);


--
-- Name: index_events_users_on_user_id_and_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_users_on_user_id_and_event_id ON public.events_users USING btree (user_id, event_id);


--
-- Name: index_leagues_on_league_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_leagues_on_league_id ON public.leagues USING btree (league_id);


--
-- Name: index_leagues_on_season_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_leagues_on_season_id ON public.leagues USING btree (season_id);


--
-- Name: index_leagues_teams_on_league_id_and_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_leagues_teams_on_league_id_and_team_id ON public.leagues_teams USING btree (league_id, team_id);


--
-- Name: index_leagues_teams_on_team_id_and_league_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_leagues_teams_on_team_id_and_league_id ON public.leagues_teams USING btree (team_id, league_id);


--
-- Name: index_match_alliances_on_alliance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_match_alliances_on_alliance_id ON public.match_alliances USING btree (alliance_id);


--
-- Name: index_matches_on_blue_alliance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_matches_on_blue_alliance_id ON public.matches USING btree (blue_alliance_id);


--
-- Name: index_matches_on_blue_score_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_matches_on_blue_score_id ON public.matches USING btree (blue_score_id);


--
-- Name: index_matches_on_event_division_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_matches_on_event_division_id ON public.matches USING btree (event_division_id);


--
-- Name: index_matches_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_matches_on_event_id ON public.matches USING btree (event_id);


--
-- Name: index_matches_on_red_alliance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_matches_on_red_alliance_id ON public.matches USING btree (red_alliance_id);


--
-- Name: index_matches_on_red_score_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_matches_on_red_score_id ON public.matches USING btree (red_score_id);


--
-- Name: index_rankings_on_context; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_rankings_on_context ON public.rankings USING btree (context_type, context_id);


--
-- Name: index_rankings_on_event_division_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_rankings_on_event_division_id ON public.rankings USING btree (event_division_id);


--
-- Name: index_rankings_on_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_rankings_on_team_id ON public.rankings USING btree (team_id);


--
-- Name: index_scores_on_season_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_scores_on_season_score ON public.scores USING btree (season_score_type, season_score_id);


--
-- Name: index_users_on_confirmation_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_confirmation_token ON public.users USING btree (confirmation_token);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_email ON public.users USING btree (email);


--
-- Name: index_users_on_invitation_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_invitation_token ON public.users USING btree (invitation_token);


--
-- Name: index_users_on_invitations_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_invitations_count ON public.users USING btree (invitations_count);


--
-- Name: index_users_on_invited_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_invited_by_id ON public.users USING btree (invited_by_id);


--
-- Name: index_users_on_invited_by_type_and_invited_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_invited_by_type_and_invited_by_id ON public.users USING btree (invited_by_type, invited_by_id);


--
-- Name: index_users_on_reset_password_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_reset_password_token ON public.users USING btree (reset_password_token);


--
-- Name: index_users_on_uid_and_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_uid_and_provider ON public.users USING btree (uid, provider);


--
-- Name: delayed_jobs delayed_jobs_after_delete_row_tr; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delayed_jobs_after_delete_row_tr AFTER DELETE ON public.delayed_jobs FOR EACH ROW WHEN (((old.strand IS NOT NULL) AND (old.next_in_strand = true))) EXECUTE FUNCTION public.delayed_jobs_after_delete_row_tr_fn();


--
-- Name: delayed_jobs delayed_jobs_before_insert_row_tr; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delayed_jobs_before_insert_row_tr BEFORE INSERT ON public.delayed_jobs FOR EACH ROW WHEN ((new.strand IS NOT NULL)) EXECUTE FUNCTION public.delayed_jobs_before_insert_row_tr_fn();


--
-- Name: event_channel_assignments fk_rails_3749bfacb8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_channel_assignments
    ADD CONSTRAINT fk_rails_3749bfacb8 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: leagues fk_rails_42dcc2afa4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT fk_rails_42dcc2afa4 FOREIGN KEY (league_id) REFERENCES public.leagues(id);


--
-- Name: award_finalists fk_rails_4eb58109b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.award_finalists
    ADD CONSTRAINT fk_rails_4eb58109b2 FOREIGN KEY (award_id) REFERENCES public.awards(id);


--
-- Name: awards fk_rails_76c8f195c4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.awards
    ADD CONSTRAINT fk_rails_76c8f195c4 FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: award_finalists fk_rails_8b9f8470ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.award_finalists
    ADD CONSTRAINT fk_rails_8b9f8470ea FOREIGN KEY (team_id) REFERENCES public.teams(number);


--
-- Name: divisions fk_rails_9d786dae98; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT fk_rails_9d786dae98 FOREIGN KEY (league_id) REFERENCES public.leagues(id);


--
-- Name: active_storage_attachments fk_rails_c3b3935057; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT fk_rails_c3b3935057 FOREIGN KEY (blob_id) REFERENCES public.active_storage_blobs(id);


--
-- Name: event_divisions fk_rails_e18ede849d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_divisions
    ADD CONSTRAINT fk_rails_e18ede849d FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20181104221430'),
('20181104221929'),
('20181104222855'),
('20181104223135'),
('20181104223157'),
('20181104223350'),
('20181104223451'),
('20181104223548'),
('20181109030433'),
('20181109031554'),
('20181111231155'),
('20181111232154'),
('20181111232817'),
('20181112015854'),
('20181112044122'),
('20181112044351'),
('20181112052934'),
('20181113040007'),
('20181113040409'),
('20181113041319'),
('20181114052105'),
('20181115041640'),
('20181115050249'),
('20181116191852'),
('20181127230949'),
('20181128203214'),
('20181128210325'),
('20181204175229'),
('20181204230015'),
('20181205025235'),
('20181212174926'),
('20181212183921'),
('20181212202408'),
('20181212205616'),
('20181219234401'),
('20181219234658'),
('20190102200716'),
('20190102212246'),
('20190120211607'),
('20190130141424'),
('20190130142313'),
('20190130142400'),
('20190130143619'),
('20190131040958'),
('20190131041208'),
('20190430050432'),
('20190430173339'),
('20190430214207'),
('20190430214234'),
('20190531031048'),
('20190531031049'),
('20190531031050'),
('20190531031051'),
('20190531031052'),
('20190531031053'),
('20190531031054'),
('20190531031055'),
('20190531031056'),
('20190531031057'),
('20190531031058'),
('20190531031059'),
('20190531031060'),
('20190531031061'),
('20190531031062'),
('20190531031063'),
('20190531031064'),
('20190531031065'),
('20190531031066'),
('20190531031067'),
('20190531031068'),
('20190716130116'),
('20190824213029'),
('20190826032030'),
('20190826032139'),
('20190826033914'),
('20190917143833'),
('20190917181555'),
('20190918002135'),
('20190918143207'),
('20191001203014'),
('20191013152818'),
('20191102181110'),
('20211115185059'),
('20211115220218'),
('20211115231644'),
('20211115235701'),
('20211116145943'),
('20211117152028');



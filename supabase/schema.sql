


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."busyness_level" AS ENUM (
    'low',
    'medium',
    'high',
    'unknown'
);


ALTER TYPE "public"."busyness_level" OWNER TO "postgres";


CREATE TYPE "public"."friendship_status" AS ENUM (
    'pending',
    'accepted',
    'blocked'
);


ALTER TYPE "public"."friendship_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_friend_request"("request_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update friendships
  set status = 'accepted', updated_at = now()
  where id = request_id
    and addressee_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'Friend request not found';
  end if;
end;
$$;


ALTER FUNCTION "public"."accept_friend_request"("request_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', new.email));
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."places_nearby"("lat" double precision, "lng" double precision, "radius_meters" integer DEFAULT 2000) RETURNS TABLE("id" "uuid", "name" "text", "latitude" double precision, "longitude" double precision, "current_busyness" "public"."busyness_level", "distance_meters" double precision)
    LANGUAGE "sql" STABLE
    AS $$
 select p.id, p.name, p.latitude, p.longitude, p.current_busyness,
        st_distance(p.geom, st_setsrid(st_makepoint(lng, lat), 4326)::geography)
 from places p
 where st_dwithin(p.geom, st_setsrid(st_makepoint(lng, lat), 4326)::geography, radius_meters)
 order by 6;
$$;


ALTER FUNCTION "public"."places_nearby"("lat" double precision, "lng" double precision, "radius_meters" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_place_busyness"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update places
  set current_busyness    = new.level,
      busyness_updated_at = new.created_at
  where id = new.place_id;
  return new;
end;
$$;


ALTER FUNCTION "public"."refresh_place_busyness"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_friendship"("friendship_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  delete from friendships
  where id = friendship_id
    and auth.uid() in (requester_id, addressee_id)
    and status in ('pending', 'accepted');

  if not found then
    raise exception 'Friendship not found';
  end if;
end;
$$;


ALTER FUNCTION "public"."remove_friendship"("friendship_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_friend_request"("target_username" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  me uuid := auth.uid();
  target uuid;
  existing friendships;
begin
  if me is null then
    raise exception 'You need to be logged in';
  end if;

  -- Stora/små bokstäver spelar ingen roll, men exakt stavning vinner om det finns flera
  select id into target from profiles
  where lower(username) = lower(trim(target_username))
  order by username = trim(target_username) desc
  limit 1;

  if target is null then
    raise exception 'No user with that username';
  end if;
  if target = me then
    raise exception 'You cannot add yourself';
  end if;

  -- Finns det redan en rad mellan oss, åt något håll?
  select * into existing from friendships
  where (requester_id = me and addressee_id = target)
     or (requester_id = target and addressee_id = me);

  if not found then
    begin
      insert into friendships (requester_id, addressee_id, status)
      values (me, target, 'pending');
    exception when unique_violation then
      -- Händer bara om båda skickar exakt samtidigt
      raise exception 'There is already a friend request between you, pull down to refresh';
    end;
    return 'Friend request sent!';
  elsif existing.status = 'accepted' then
    raise exception 'You are already friends';
  elsif existing.status = 'pending' and existing.requester_id = me then
    raise exception 'Friend request already sent';
  elsif existing.status = 'pending' then
    -- De har redan skickat en förfrågan till mig, så vi blir vänner direkt
    update friendships set status = 'accepted', updated_at = now()
    where id = existing.id and status = 'pending';
    if not found then
      raise exception 'Could not send friend request, try again';
    end if;
    return 'You are now friends!';
  else
    raise exception 'Could not send friend request';
  end if;
end;
$$;


ALTER FUNCTION "public"."send_friend_request"("target_username" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."busyness_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "place_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "level" "public"."busyness_level" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."busyness_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."check_ins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "place_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "checked_in_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "checked_out_at" timestamp with time zone
);


ALTER TABLE "public"."check_ins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."friendships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "addressee_id" "uuid" NOT NULL,
    "status" "public"."friendship_status" DEFAULT 'pending'::"public"."friendship_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "friendships_not_self" CHECK (("requester_id" <> "addressee_id")),
    CONSTRAINT "no_self_friendship" CHECK (("requester_id" <> "addressee_id"))
);


ALTER TABLE "public"."friendships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."places" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "address" "text",
    "building" "text",
    "floor" "text",
    "opening_hours" "text",
    "amenities" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "current_busyness" "public"."busyness_level" DEFAULT 'unknown'::"public"."busyness_level" NOT NULL,
    "busyness_updated_at" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "geom" "extensions"."geography"(Point,4326) GENERATED ALWAYS AS (("extensions"."st_setsrid"("extensions"."st_makepoint"("longitude", "latitude"), 4326))::"extensions"."geography") STORED,
    "description" "text",
    "image_urls" "text"[] DEFAULT '{}'::"text"[] NOT NULL
);


ALTER TABLE "public"."places" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "share_location" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "place_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "rating" smallint NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "reviews_rating_range" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_places" (
    "user_id" "uuid" NOT NULL,
    "place_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_places" OWNER TO "postgres";


ALTER TABLE ONLY "public"."busyness_reports"
    ADD CONSTRAINT "busyness_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."check_ins"
    ADD CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "one_review_per_user_place" UNIQUE ("place_id", "user_id");



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_places"
    ADD CONSTRAINT "saved_places_pkey" PRIMARY KEY ("user_id", "place_id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "unique_pair" UNIQUE ("requester_id", "addressee_id");



CREATE INDEX "busyness_reports_place_time_idx" ON "public"."busyness_reports" USING "btree" ("place_id", "created_at" DESC);



CREATE UNIQUE INDEX "check_ins_one_active_per_user" ON "public"."check_ins" USING "btree" ("user_id") WHERE ("checked_out_at" IS NULL);



CREATE UNIQUE INDEX "friendships_pair_unique" ON "public"."friendships" USING "btree" (LEAST("requester_id", "addressee_id"), GREATEST("requester_id", "addressee_id"));



CREATE INDEX "places_geom_idx" ON "public"."places" USING "gist" ("geom");



CREATE OR REPLACE TRIGGER "on_busyness_report" AFTER INSERT ON "public"."busyness_reports" FOR EACH ROW EXECUTE FUNCTION "public"."refresh_place_busyness"();



ALTER TABLE ONLY "public"."busyness_reports"
    ADD CONSTRAINT "busyness_reports_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."busyness_reports"
    ADD CONSTRAINT "busyness_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."check_ins"
    ADD CONSTRAINT "check_ins_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."check_ins"
    ADD CONSTRAINT "check_ins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_places"
    ADD CONSTRAINT "saved_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_places"
    ADD CONSTRAINT "saved_places_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Users can see their own friendships" ON "public"."friendships" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "requester_id") OR (( SELECT "auth"."uid"() AS "uid") = "addressee_id")));



ALTER TABLE "public"."busyness_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."check_ins" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "friends see check-ins when sharing is on" ON "public"."check_ins" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."friendships" "f"
     JOIN "public"."profiles" "p" ON (("p"."id" = "check_ins"."user_id")))
  WHERE (("f"."status" = 'accepted'::"public"."friendship_status") AND ("p"."share_location" = true) AND ((("f"."requester_id" = "auth"."uid"()) AND ("f"."addressee_id" = "check_ins"."user_id")) OR (("f"."addressee_id" = "auth"."uid"()) AND ("f"."requester_id" = "check_ins"."user_id")))))));



ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."places" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "places are public" ON "public"."places" FOR SELECT USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles are public" ON "public"."profiles" FOR SELECT USING (true);



ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reviews are public" ON "public"."reviews" FOR SELECT USING (true);



ALTER TABLE "public"."saved_places" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "signed-in users can add places" ON "public"."places" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "users create own reports" ON "public"."busyness_reports" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users manage own check-ins" ON "public"."check_ins" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users manage own reviews" ON "public"."reviews" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users manage own saved places" ON "public"."saved_places" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users see own check-ins" ON "public"."check_ins" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users see own reports" ON "public"."busyness_reports" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "users see own saved places" ON "public"."saved_places" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."accept_friend_request"("request_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."accept_friend_request"("request_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."remove_friendship"("friendship_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."remove_friendship"("friendship_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."send_friend_request"("target_username" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."send_friend_request"("target_username" "text") TO "authenticated";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."busyness_reports" TO "anon";
GRANT ALL ON TABLE "public"."busyness_reports" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."busyness_reports" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."check_ins" TO "anon";
GRANT ALL ON TABLE "public"."check_ins" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."check_ins" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."friendships" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."friendships" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."friendships" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."places" TO "anon";
GRANT ALL ON TABLE "public"."places" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."places" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."reviews" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."saved_places" TO "anon";
GRANT ALL ON TABLE "public"."saved_places" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."saved_places" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";








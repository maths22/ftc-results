# frozen_string_literal: true

require 'rails_helper'

SAMPLE_SEASON = '2023-2024'
SAMPLE_EVENT = 'USILCHS1'
SAMPLE_LEAGUE = 'CHI'
SCORE_TYPES = %i[RoverRuckusScore RoverRuckusCriScore SkystoneScore FreightFrenzyScore FreightFrenzyCriScore PowerPlayScore PowerPlayCriScore CenterstageScore CenterstageCriScore IntoTheDeepScore IntoTheDeepCriScore]
REMOTE_SCORE_TYPES = %i[UltimateGoalScoreRemote FreightFrenzyScoreRemote]

RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  # NOTE: If you're using the rswag-api to serve API descriptions, you'll need
  # to ensure that it's configured to serve Swagger from the same folder
  config.openapi_root = Rails.root.join('swagger').to_s

  # Define one or more Swagger documents and provide global metadata for each one
  # When you run the 'rswag:specs:swaggerize' rake task, the complete Swagger will
  # be generated at the provided relative path under openapi_root
  # By default, the operations defined in spec files are added to the first
  # document below. You can override this behavior by adding a openapi_spec tag to the
  # the root example_group in your specs, e.g. describe '...', openapi_spec: 'v2/swagger.json'
  config.openapi_specs = {
    'v1/swagger.yaml' => {
      openapi: '3.1.0',
      info: {
        title: 'IL/CRI FTC Results API V1',
        summary: 'API for retrieving event information, including matches, rankings, and awards for FTC events in Illinois, including CRI',
        description: <<~DESC,
          This API provides historical event data going back to the 2018-2019 rover ruckus season. This API also provides real
          time data for the Chicago Robotics Invitational, which is unable to use the FIRST-provided API due to the modified game played at
          that event.

          No authentication is required to use this API.

          Most endpoints are cached in a CDN for 30 seconds to reduce load on the server, so there is no value in requesting updated data
          more frequently than that.  A few endpoints that rarely change are cached for longer.  The `cache-control` header can be viewed to
          see how long data will be cached, and the `date` header can be viewed on any request to see how stale the data is.
DESC
        contact: {
          "name": "Jacob Burroughs",
          "email": "jburroughs@firstillinoisrobotics.org"
        },
        version: 'v1'
      },
      components: {
        schemas: {
          season: {
            type: :object,
            properties: {
              id: { type: :integer },
              year: { type: :string, description: 'Full season year range (e.g. 2023-2024).  For offseasons, suffixed with `-off-<short_name>`' },
              name: { type: :string },
              active: { type: :boolean, description: 'Are events currently being played for this season?' },
              offseason: { type: :boolean, description: 'Does this season have data with modified rules and scoring?' }
            },
            required: %i[id year name active offseason]
          },
          winRecord: {
            type: :object,
            properties: {
              win: { type: :integer },
              loss: { type: :integer },
              tie: { type: :integer },
            },
            required: %i[win loss tie]
          },
          event: {
            type: :object,
            properties: {
              id: { type: :integer },
              aasm_state: { type: :string, enum: %i[not_started in_progress finalized canceled] },
              context_id: { type: :integer },
              context_type: { type: :string, enum: %w[League Division] },
              league: { type: :string, description: 'Slug of league this event belongs to'},
              season_id: { type: :integer },
              season: { type: :string, description: 'Year string for season' },
              type: { type: :string, enum: %i[scrimmage league_meet qualifier league_tournament championship] },
              remote: { type: :boolean },
              slug: { type: :string, description: 'Short human-readable ID for event' },
              name: { type: :string },
              start_date: { type: :string, format: :date },
              end_date: { type: :string, format: :date },
              location: { type: :string, description: 'Name/description of venue' },
              address: { type: :string },
              city: { type: :string },
              state: { type: :string },
              country: { type: :string },
              channel: { type: :string, description: 'Twitch channel event is streaming on' },
              can_import: { type: :boolean, description: 'Always false in public API' },
              import: { type: :string, description: 'Link to download database (authenticated event owners only)' },
              owners: { type: :array, description: 'List of event owners (authenticated event owners only)', items: {
                type: :object,
                properties: {
                  uid: { type: :string },
                  name: { type: :string }
                },
                required: %i[uid]
              } },
              divisions: { type: :array, items: {
                type: :object, properties: {
                  id: { type: :integer },
                  event_id: { type: :integer, description: 'ID of event containing this division' },
                  name: { type: :string },
                  slug: { type: :string, description: 'Short human-readable ID for division' },
                  import: { type: :string, description: 'Link to download database (authenticated event owners only)' }
                },
                required: %i[id event_id name slug]
              } },
              has_practice: { type: :boolean }
            },
            required: %i[id aasm_state season_id season type remote slug name start_date end_date location city state country can_import divisions has_practice]
          },
          league: {
            type: :object,
            properties: {
              id: { type: :integer },
              name: { type: :string },
              slug: { type: :string, description: 'Short human-readable ID for league' },
              team_count: { type: :integer },
              season_id: { type: :integer },
              parent_league: { type: :string, description: 'Parent league slug (only populated for child leagues)' }
            },
            required: %i[id name slug team_count season_id]
          },
          team: {
            type: :object,
            properties: {
              number: { type: :integer },
              name: { type: :string },
              organization: { type: :string },
              city: { type: :string },
              state: { type: :string },
              country: { type: :string },
              rookie_year: { type: :string },
              updated_at: { type: :string }
            },
            required: %i[number name organization city state country rookie_year updated_at]
          },
          alliance: {
            type: :object,
            properties: {
              id: { type: :integer },
              event_id: { type: :integer },
              seed: { type: :integer },
              teams: { type: :array, items: { type: :integer } },
              division: { type: :string }
            },
            required: %i[id event_id seed teams]
          },
          ranking: {
            type: :object,
            properties: {
              id: { type: :integer },
              team: { type: :integer },
              context_id: { type: :integer },
              context_type: { type: :string, enum: %w[Event League Division] },
              league: { type: :string },
              ranking: { type: :integer },
              sort_order1: { type: :number },
              sort_order2: { type: :number },
              sort_order3: { type: :number },
              sort_order4: { type: :number },
              sort_order5: { type: :number },
              sort_order6: { type: :number },
              matches_played: { type: :integer },
              matches_counted: { type: :integer },
              division: { type: :string },
              record: { '$ref' => '#/components/schemas/winRecord' }
            },
            required: %i[id team context_id context_type ranking sort_order1 sort_order2 sort_order3 sort_order4 sort_order5 sort_order6 sort_order6 matches_played matches_counted record]
          },
          elimRanking: {
            type: :object,
            properties: {
              id: { type: :integer },
              alliance: { type: :integer },
              context_id: { type: :integer },
              context_type: { type: :string, enum: %w[Event League Division] },
              ranking: { type: :integer },
              sort_order1: { type: :number },
              sort_order2: { type: :number },
              sort_order3: { type: :number },
              sort_order4: { type: :number },
              sort_order5: { type: :number },
              sort_order6: { type: :number },
              matches_played: { type: :integer },
              matches_counted: { type: :integer },
              division: { type: :string },
              record: { '$ref' => '#/components/schemas/winRecord' }
            },
            required: %i[id team context_id context_type ranking sort_order1 sort_order2 sort_order3 sort_order4 sort_order5 sort_order6 sort_order6 matches_played matches_counted record]
          },
          award: {
            type: :object,
            properties: {
              id: { type: :integer },
              event_id: { type: :integer },
              name: { type: :string },
              description: { type: :string },
              finalists: { type: :array, items: { '$ref' => '#/components/schemas/awardFinalist' } }
            },
            required: %i[id event_id name finalists]
          },
          awardFinalist: {
            type: :object,
            properties: {
              place: { type: :integer },
              recipient: { type: :string },
              team_id: { type: :number },
              description: { type: :string },
            },
            required: [:place]
          },
          match: {
            type: :object,
            properties: {
              id: { type: :integer },
              event_id: { type: :integer },
              division: { type: :string },
              phase: { type: :string, enum: %i[qual semi final interfinal playoff practice] },
              series: { type: :integer },
              number: { type: :integer },
              name: { type: :string },
              played: { type: :boolean },
              red_alliance: { type: :array, items: { type: :integer } },
              red_surrogate: { type: :array, items: { type: :boolean } },
              blue_alliance: { type: :array, items: { type: :integer } },
              blue_surrogate: { type: :array, items: { type: :boolean } },
              red_score: { type: :integer },
              blue_score: { type: :integer }
            },
            required: %i[id event_id phase number name played red_alliance red_surrogate blue_alliance blue_surrogate]
          },
          remoteMatch: {
            type: :object,
            properties: {
              id: { type: :integer },
              event_id: { type: :integer },
              division: { type: :string },
              phase: { type: :string, enum: %i[qual semi final interfinal] },
              series: { type: :integer },
              number: { type: :integer },
              name: { type: :string },
              played: { type: :boolean },
              team: { type: :integer },
              score: { type: :integer },
              no_show: { type: :boolean }
            },
            required: %i[id event_id phase number name played team no_show]
          },
          matchDetails: {
            type: :object,
            properties: {
              id: { type: :integer },
              phase: { type: :string, enum: %i[qual semi final interfinal] },
              series: { type: :integer },
              number: { type: :integer },
              event_id: { type: :integer },
              season_score_type: { type: :string, enum: SCORE_TYPES },
              red_score_total: { type: :integer },
              red_score: {
                type: :object,
                properties: {
                  auto: { type: :integer },
                  teleop: { type: :integer },
                  endgame: { type: :integer },
                  penalty: { type: :integer }
                },
                required: %i[auto teleop endgame penalty]
              },
              red_score_details: {
                oneOf: SCORE_TYPES.map { |st| { '$ref' => "#/components/schemas/#{st}" } }
              },
              red_teams: {
                type: :array,
                items: { type: :integer },
              },
              red_starts: {
                type: :array,
                items: { type: :string, enum: %i[NO_SHOW NO_ROBOT FRONT MIDDLE BACK] },
              },
              blue_score_total: { type: :integer },
              blue_score: {
                type: :object,
                properties: {
                  auto: { type: :integer },
                  teleop: { type: :integer },
                  endgame: { type: :integer },
                  penalty: { type: :integer }
                },
                required: %i[auto teleop endgame penalty]
              },
              blue_score_details: {
                oneOf: SCORE_TYPES.map { |st| { '$ref' => "#/components/schemas/#{st}" } }
              },
              blue_teams: {
                type: :array,
                items: { type: :integer },
              },
              blue_starts: {
                type: :array,
                items: { type: :string, enum: %i[NO_SHOW NO_ROBOT FRONT MIDDLE BACK] },
              },
            },
            required: %i[id phase number event_id season_score_type red_score_total red_score red_score_details red_teams blue_score_total blue_score blue_score_details blue_teams]
          },
          remoteMatchDetails: {
            type: :object,
            properties: {
              id: { type: :integer },
              phase: { type: :string, enum: %i[qual semi final interfinal] },
              series: { type: :integer },
              number: { type: :integer },
              event_id: { type: :integer },
              season_score_type: { type: :string, enum: REMOTE_SCORE_TYPES },
              score_total: { type: :integer },
              score: {
                type: :object,
                properties: {
                  auto: { type: :integer },
                  teleop: { type: :integer },
                  endgame: { type: :integer },
                  penalty: { type: :integer }
                },
                required: %i[auto teleop endgame penalty]
              },
              score_details: {
                oneOf: REMOTE_SCORE_TYPES.map { |st| { '$ref' => "#/components/schemas/#{st}" } }
              }
            },
            required: %i[id phase number event_id season_score_type score_total score score_details]
          },
          RoverRuckusScore: {
            type: :object,
            properties: {
              robots_landed: { type: :integer },
              depots_claimed: { type: :integer },
              robots_parked_auto: { type: :integer },
              fields_sampled: { type: :integer },
              depot_minerals: { type: :integer },
              gold_cargo: { type: :integer },
              silver_cargo: { type: :integer },
              latched_robots: { type: :integer },
              robots_in_crater: { type: :integer },
              robots_completely_in_crater: { type: :integer },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer }
            },
            required: %i[robots_landed depots_claimed robots_parked_auto fields_sampled depot_minerals gold_cargo silver_cargo latched_robots robots_in_crater robots_completely_in_crater minor_penalties major_penalties]
          },
          RoverRuckusCriScore: {
            type: :object,
            properties: {
              robots_landed: { type: :integer },
              depots_claimed: { type: :integer },
              robots_parked_auto: { type: :integer },
              fields_sampled: { type: :integer },
              depot_minerals: { type: :integer },
              depot_platinum_minerals: { type: :integer },
              gold_cargo: { type: :integer },
              silver_cargo: { type: :integer },
              any_cargo: { type: :integer },
              platinum_cargo: { type: :integer },
              latched_robots: { type: :integer },
              any_latched_robots: { type: :integer },
              robots_in_crater: { type: :integer },
              robots_completely_in_crater: { type: :integer },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer }
            },
            required: %i[robots_landed depots_claimed robots_parked_auto fields_sampled depot_minerals depot_platinum_minerals gold_cargo silver_cargo any_cargo platinum_cargo latched_robots any_latched_robots robots_in_crater robots_completely_in_crater minor_penalties major_penalties]
          },
          SkystoneScore: {
            type: :object,
            properties: {
              auto_skystones: { type: :integer },
              auto_delivered: { type: :integer },
              auto_placed: { type: :integer },
              robots_navigated: { type: :integer },
              foundation_repositioned: { type: :integer },
              teleop_placed: { type: :integer },
              teleop_delivered: { type: :integer },
              tallest_height: { type: :integer },
              foundation_moved: { type: :integer },
              robots_parked: { type: :integer },
              capstone_1_level: { type: :integer },
              capstone_2_level: { type: :integer },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer }
            },
            required: %i[auto_skystones auto_delivered auto_placed robots_navigated foundation_repositioned teleop_placed teleop_delivered tallest_height foundation_moved robots_parked capstone_1_level capstone_2_level minor_penalties major_penalties]
          },
          UltimateGoalScoreRemote: {
            type: :object,
            properties: {
              wobble_1_delivered: { type: :boolean },
              wobble_2_delivered: { type: :boolean },
              auto_tower_high: { type: :integer },
              auto_tower_mid: { type: :integer },
              auto_tower_low: { type: :integer },
              auto_power_shot_left: { type: :boolean },
              auto_power_shot_center: { type: :boolean },
              auto_power_shot_right: { type: :boolean },
              navigated: { type: :boolean },
              teleop_tower_high: { type: :integer },
              teleop_tower_mid: { type: :integer },
              teleop_tower_low: { type: :integer },
              teleop_power_shot_left: { type: :boolean },
              teleop_power_shot_center: { type: :boolean },
              teleop_power_shot_right: { type: :boolean },
              wobble_1_rings: { type: :integer },
              wobble_2_rings: { type: :integer },
              wobble_1_end: { type: :integer },
              wobble_2_end: { type: :integer },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer },
            },
            required: %i[wobble_1_delivered wobble_2_delivered auto_tower_high auto_tower_mid auto_tower_low auto_power_shot_left auto_power_shot_center auto_power_shot_right navigated teleop_tower_high teleop_tower_mid teleop_tower_low teleop_power_shot_left teleop_power_shot_center teleop_power_shot_right wobble_1_rings wobble_2_rings wobble_1_end wobble_2_end minor_penalties major_penalties]
          },
          FreightFrenzyScore: {
            type: :object,
            properties: {
              barcode_element1: { type: :string, enum: %i[DUCK TEAM_SHIPPING_ELEMENT] },
              barcode_element2: { type: :string, enum: %i[DUCK TEAM_SHIPPING_ELEMENT] },
              carousel: { type: :boolean },
              auto_navigated1: { type: :string, enum: %i[NONE IN_STORAGE COMPLETELY_IN_STORAGE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              auto_navigated2: { type: :string, enum: %i[NONE IN_STORAGE COMPLETELY_IN_STORAGE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              auto_bonus1: { type: :boolean },
              auto_bonus2: { type: :boolean },
              auto_storage_freight: { type: :integer },
              auto_freight1: { type: :integer },
              auto_freight2: { type: :integer },
              auto_freight3: { type: :integer },
              teleop_storage_freight: { type: :integer },
              teleop_freight1: { type: :integer },
              teleop_freight2: { type: :integer },
              teleop_freight3: { type: :integer },
              shared_freight: { type: :integer },
              end_delivered: { type: :integer },
              alliance_balanced: { type: :boolean },
              shared_unbalanced: { type: :boolean },
              end_parked1: { type: :string, enum: %i[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              end_parked2: { type: :string, enum: %i[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              capped: { type: :integer },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer }
            },
            required: %i[barcode_element1 barcode_element2 carousel auto_navigated1 auto_navigated2 auto_bonus1 auto_bonus2 auto_storage_freight auto_freight1 auto_freight2 auto_freight3 teleop_storage_freight teleop_freight1 teleop_freight2 teleop_freight3 shared_freight end_delivered alliance_balanced shared_unbalanced end_parked1 end_parked2 capped minor_penalties major_penalties]
          },
          FreightFrenzyScoreRemote: {
            type: :object,
            properties: {
              barcode_element: { type: :string, enum: %i[DUCK TEAM_SHIPPING_ELEMENT] },
              carousel: { type: :boolean },
              auto_navigated: { type: :string, enum: %i[NONE IN_STORAGE COMPLETELY_IN_STORAGE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              auto_bonus: { type: :boolean },
              auto_storage_freight: { type: :integer },
              auto_freight1: { type: :integer },
              auto_freight2: { type: :integer },
              auto_freight3: { type: :integer },
              teleop_storage_freight: { type: :integer },
              teleop_freight1: { type: :integer },
              teleop_freight2: { type: :integer },
              teleop_freight3: { type: :integer },
              end_delivered: { type: :integer },
              alliance_balanced: { type: :boolean },
              end_parked: { type: :string, enum: %i[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              capped: { type: :integer },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer },
            },
            required: %i[barcode_element carousel auto_navigated auto_bonus auto_storage_freight auto_freight1 auto_freight2 auto_freight3 teleop_storage_freight teleop_freight1 teleop_freight2 teleop_freight3 end_delivered alliance_balanced end_parked capped minor_penalties major_penalties]
          },
          FreightFrenzyCriScore: {
            type: :object,
            properties: {
              barcode_element1: { type: :string, enum: %i[DUCK TEAM_SHIPPING_ELEMENT] },
              barcode_element2: { type: :integer, enum: %i[DUCK TEAM_SHIPPING_ELEMENT] },
              barcode_element3: { type: :integer, enum: %i[DUCK TEAM_SHIPPING_ELEMENT] },
              carousel: { type: :boolean },
              auto_navigated1: { type: :string, enum: %i[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              auto_navigated2: { type: :string, enum: %i[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              auto_navigated3: { type: :string, enum: %i[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              auto_bonus1: { type: :boolean },
              auto_bonus2: { type: :boolean },
              auto_bonus3: { type: :boolean },
              auto_freight1: { type: :integer },
              auto_freight2: { type: :integer },
              auto_freight3: { type: :integer },
              auto_coop_freight: { type: :integer },
              teleop_freight1: { type: :integer },
              teleop_freight2: { type: :integer },
              teleop_freight3: { type: :integer },
              shared_freight: { type: :integer },
              teleop_coop_freight: { type: :integer },
              teleop_other_coop_freight: { type: :integer },
              end_delivered: { type: :integer },
              alliance_balanced: { type: :boolean },
              shared_unbalanced: { type: :boolean },
              coop_balanced: { type: :boolean },
              end_parked1: { type: :string, enum: %i[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              end_parked2: { type: :string, enum: %i[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              end_parked3: { type: :string, enum: %i[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE] },
              capped: { type: :integer },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer }
            },
            required: %i[barcode_element1 barcode_element2 barcode_element3 carousel auto_navigated1 auto_navigated2 auto_navigated3 auto_bonus1 auto_bonus2 auto_bonus3 auto_freight1 auto_freight2 auto_freight3 auto_coop_freight teleop_freight1 teleop_freight2 teleop_freight3 shared_freight teleop_coop_freight teleop_other_coop_freight end_delivered alliance_balanced shared_unbalanced coop_balanced end_parked1 end_parked2 end_parked3 capped minor_penalties major_penalties]
          },
          PowerPlayScore: {
            type: :object,
            properties: {
              init_signal_sleeve1: { type: :boolean },
              init_signal_sleeve2: { type: :integer },
              auto_navigated1: { type: :string, enum: %i[NONE SUBSTATION_TERMINAL SIGNAL_ZONE] },
              auto_navigated2: { type: :string, enum: %i[NONE SUBSTATION_TERMINAL SIGNAL_ZONE] },
              auto_terminal: { type: :integer },
              # TODO make this more specific when I get to TS
              auto_junctions: { type: :array },
              teleop_junctions: { type: :array },
              teleop_terminal_near: { type: :integer },
              teleop_terminal_far: { type: :integer },
              teleop_navigated1: { type: :boolean },
              teleop_navigated2: { type: :boolean },
              auto_cone_counts: {
                type: :object,
                properties: {
                  HIGH: { type: :integer},
                  MEDIUM: { type: :integer},
                  LOW: { type: :integer},
                  GROUND: { type: :integer},
                },
                required: %i[HIGH MEDIUM LOW GROUND]
              },
              teleop_cone_counts: {
                type: :object,
                properties: {
                  HIGH: { type: :integer},
                  MEDIUM: { type: :integer},
                  LOW: { type: :integer},
                  GROUND: { type: :integer},
                },
                required: %i[HIGH MEDIUM LOW GROUND]
              },
              cone_owned_junctions: { type: :integer },
              beacon_owned_junctions: { type: :integer },
              has_circuit: { type: :boolean },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer }
            },
            required: %i[init_signal_sleeve1 init_signal_sleeve2 auto_navigated1 auto_navigated2 auto_terminal auto_junctions teleop_junctions teleop_terminal_near teleop_terminal_far teleop_navigated1 teleop_navigated2 auto_cone_counts teleop_cone_counts cone_owned_junctions beacon_owned_junctions has_circuit minor_penalties major_penalties]
          },
          PowerPlayCriScore: {
            type: :object,
            properties: {
              init_signal_sleeve1: { type: :boolean },
              init_signal_sleeve2: { type: :integer },
              init_signal_sleeve3: { type: :integer },
              auto_navigated1: { type: :string, enum: %i[NONE SUBSTATION_TERMINAL SIGNAL_ZONE] },
              auto_navigated2: { type: :string, enum: %i[NONE SUBSTATION_TERMINAL SIGNAL_ZONE] },
              auto_navigated3: { type: :string, enum: %i[NONE SUBSTATION_TERMINAL SIGNAL_ZONE] },
              auto_terminal: { type: :integer },
              # TODO make this more specific when I get to TS
              auto_junctions: { type: :array },
              teleop_junctions: { type: :array },
              teleop_terminal_near: { type: :integer },
              teleop_terminal_far: { type: :integer },
              teleop_navigated1: { type: :boolean },
              teleop_navigated2: { type: :boolean },
              teleop_navigated3: { type: :boolean },
              auto_cone_counts: {
                type: :object,
                properties: {
                  HIGH: { type: :integer},
                  MEDIUM: { type: :integer},
                  LOW: { type: :integer},
                  GROUND: { type: :integer},
                },
                required: %i[HIGH MEDIUM LOW GROUND]
              },
              auto_transformed_cones: { type: :integer },
              teleop_cone_counts: {
                type: :object,
                properties: {
                  HIGH: { type: :integer},
                  MEDIUM: { type: :integer},
                  LOW: { type: :integer},
                  GROUND: { type: :integer},
                },
                required: %i[HIGH MEDIUM LOW GROUND]
              },
              teleop_transformed_cones: { type: :integer },
              cone_owned_junctions: { type: :integer },
              beacon_owned_junctions: { type: :integer },
              has_circuit: { type: :boolean },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer }
            },
            required: %i[init_signal_sleeve1 init_signal_sleeve2 init_signal_sleeve3 auto_navigated1 auto_navigated2 auto_navigated3 auto_terminal auto_junctions teleop_junctions teleop_terminal_near teleop_terminal_far teleop_navigated1 teleop_navigated2 teleop_navigated3 auto_cone_counts auto_transformed_cones teleop_cone_counts teleop_transformed_cones cone_owned_junctions beacon_owned_junctions has_circuit minor_penalties major_penalties]
          },
          CenterstageScore: {
            type: :object,
            properties: {
              init_team_prop1: { type: :boolean },
              init_team_prop2: { type: :boolean },
              robot1_auto: { type: :boolean },
              robot2_auto: { type: :boolean },
              spike_mark_pixel1: { type: :boolean },
              spike_mark_pixel2: { type: :boolean },
              target_backdrop_pixel1: { type: :boolean },
              target_backdrop_pixel2: { type: :boolean },
              auto_backdrop: { type: :integer },
              auto_backstage: { type: :integer },
              teleop_backdrop: { type: :integer },
              teleop_backstage: { type: :integer },
              mosaics: { type: :integer },
              max_set_line: { type: :integer },
              teleop_robot1: { type: :string, enum: %i[NONE BACKSTAGE RIGGING] },
              teleop_robot2: { type: :string, enum: %i[NONE BACKSTAGE RIGGING]},
              drone1: { type: :integer },
              drone2: { type: :integer },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer },
            },
            required: %i[init_team_prop1 init_team_prop2 robot1_auto robot2_auto spike_mark_pixel1 spike_mark_pixel2 target_backdrop_pixel1 target_backdrop_pixel2 auto_backdrop auto_backstage teleop_backdrop teleop_backstage mosaics max_set_line teleop_robot1 teleop_robot2 drone1 drone2 minor_penalties major_penalties]
          },
          CenterstageCriScore: {
            type: :object,
            properties: {
              init_team_prop1: { type: :boolean },
              init_team_prop2: { type: :boolean },
              init_team_prop3: { type: :boolean },
              robot1_auto: { type: :boolean },
              robot2_auto: { type: :boolean },
              robot3_auto: { type: :boolean },
              spike_mark_pixel1: { type: :boolean },
              spike_mark_pixel2: { type: :boolean },
              spike_mark_pixel3: { type: :boolean },
              target_backdrop_pixel1: { type: :boolean },
              target_backdrop_pixel2: { type: :boolean },
              target_backdrop_pixel3: { type: :boolean },
              auto_backstage: { type: :integer },
              auto_own_backdrop: { type: :integer },
              auto_own_mosaics: { type: :integer },
              auto_own_max_set_line: { type: :integer },
              auto_shared_backdrop: { type: :integer },
              auto_shared_mosaics: { type: :integer },
              auto_shared_max_set_line: { type: :integer },
              teleop_backstage: { type: :integer },
              teleop_own_backdrop: { type: :integer },
              teleop_own_mosaics: { type: :integer },
              teleop_own_max_set_line: { type: :integer },
              teleop_shared_backdrop: { type: :integer },
              teleop_shared_mosaics: { type: :integer },
              teleop_shared_max_set_line: { type: :integer },
              alliance_pixels: { type: :integer },
              other_alliance_pixels: { type: :integer },
              teleop_robot1: { type: :string, enum: %i[NONE BACKSTAGE RIGGING] },
              teleop_robot2: { type: :string, enum: %i[NONE BACKSTAGE RIGGING] },
              teleop_robot3: { type: :string, enum: %i[NONE BACKSTAGE RIGGING] },
              drone1: { type: :integer },
              drone2: { type: :integer },
              drone3: { type: :integer },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer },
              collage: { type: :boolean },
              mural: { type: :boolean },
              finale: { type: :boolean },
            },
            required: %i[init_team_prop1 init_team_prop2 init_team_prop3 robot1_auto robot2_auto robot3_auto spike_mark_pixel1 spike_mark_pixel2 spike_mark_pixel3 target_backdrop_pixel1 target_backdrop_pixel2 target_backdrop_pixel3 auto_backstage auto_own_backdrop auto_own_mosaics auto_own_max_set_line auto_shared_backdrop auto_shared_mosaics auto_shared_max_set_line teleop_backstage teleop_own_backdrop teleop_own_mosaics teleop_own_max_set_line teleop_shared_backdrop teleop_shared_mosaics teleop_shared_max_set_line alliance_pixels other_alliance_pixels teleop_robot1 teleop_robot2 teleop_robot3 drone1 drone2 drone3 minor_penalties major_penalties collage mural finale]
          },
          IntoTheDeepScore: {
            type: :object,
            properties: {
              auto_robot1: { type: :string, enum: %i[NONE OBSERVATION_ZONE ASCENT] },
              auto_robot2: { type: :string, enum: %i[NONE OBSERVATION_ZONE ASCENT] },
              auto_sample_net: { type: :integer },
              auto_sample_low: { type: :integer },
              auto_sample_high: { type: :integer },
              auto_specimen_low: { type: :integer },
              auto_specimen_high: { type: :integer },
              teleop_sample_net: { type: :integer },
              teleop_sample_low: { type: :integer },
              teleop_sample_high: { type: :integer },
              teleop_specimen_low: { type: :integer },
              teleop_specimen_high: { type: :integer },
              teleop_robot1: { type: :string, enum: %i[NONE OBSERVATION_ZONE ASCENT_1 ASCENT_2 ASCENT_3] },
              teleop_robot2: { type: :string, enum: %i[NONE OBSERVATION_ZONE ASCENT_1 ASCENT_2 ASCENT_3] },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer },
            },
            required: %i[auto_robot1 auto_robot2 auto_sample_net auto_sample_low auto_sample_high auto_specimen_low auto_specimen_high teleop_sample_net teleop_sample_low teleop_sample_high teleop_specimen_low teleop_specimen_high teleop_robot1 teleop_robot2 minor_penalties major_penalties]
          },
          IntoTheDeepCriScore: {
            type: :object,
            properties: {
              auto_robot1: { type: :string, enum: %i[NONE OBSERVATION_ZONE ASCENT] },
              auto_robot2: { type: :string, enum: %i[NONE OBSERVATION_ZONE ASCENT] },
              auto_robot3: { type: :string, enum: %i[NONE OBSERVATION_ZONE ASCENT] },
              auto_sample_net_near: { type: :integer },
              auto_sample_low_near: { type: :integer },
              auto_sample_high_near: { type: :integer },
              auto_sample_net_far: { type: :integer },
              auto_sample_low_far: { type: :integer },
              auto_sample_high_far: { type: :integer },
              auto_specimen_low_1: { type: :integer },
              auto_specimen_high_1: { type: :integer },
              auto_specimen_low_2: { type: :integer },
              auto_specimen_high_2: { type: :integer },
              auto_specimen_low_3: { type: :integer },
              auto_specimen_high_3: { type: :integer },
              auto_specimen_low_4: { type: :integer },
              auto_specimen_high_4: { type: :integer },
              auto_owned_chambers: { type: :integer },
              teleop_sample_net_near: { type: :integer },
              teleop_sample_low_near: { type: :integer },
              teleop_sample_high_near: { type: :integer },
              teleop_sample_net_far: { type: :integer },
              teleop_sample_low_far: { type: :integer },
              teleop_sample_high_far: { type: :integer },
              teleop_specimen_low_1: { type: :integer },
              teleop_specimen_high_1: { type: :integer },
              teleop_specimen_low_2: { type: :integer },
              teleop_specimen_high_2: { type: :integer },
              teleop_specimen_low_3: { type: :integer },
              teleop_specimen_high_3: { type: :integer },
              teleop_specimen_low_4: { type: :integer },
              teleop_specimen_high_4: { type: :integer },
              teleop_owned_chambers: { type: :integer },
              teleop_robot1: { type: :string, enum: %i[NONE OBSERVATION_ZONE ASCENT_1 ASCENT_2 ASCENT_3] },
              teleop_robot2: { type: :string, enum: %i[NONE OBSERVATION_ZONE ASCENT_1 ASCENT_2 ASCENT_3] },
              teleop_robot3: { type: :string, enum: %i[NONE OBSERVATION_ZONE ASCENT_1 ASCENT_2 ASCENT_3] },
              coop_achieved: { type: :boolean },
              minor_penalties: { type: :integer },
              major_penalties: { type: :integer },
            },
            required: %i[auto_robot1 auto_robot2 auto_robot3 auto_sample_net_near auto_sample_low_near auto_sample_high_near auto_sample_net_far auto_sample_low_far auto_sample_high_far auto_specimen_low_1 auto_specimen_high_1 auto_specimen_low_2 auto_specimen_high_2 auto_specimen_low_3 auto_specimen_high_3 auto_specimen_low_4 auto_specimen_high_4 auto_owned_chambers teleop_sample_net_near teleop_sample_low_near teleop_sample_high_near teleop_sample_net_far teleop_sample_low_far teleop_sample_high_far teleop_specimen_low_1 teleop_specimen_high_1 teleop_specimen_low_2 teleop_specimen_high_2 teleop_specimen_low_3 teleop_specimen_high_3 teleop_specimen_low_4 teleop_specimen_high_4 teleop_owned_chambers teleop_robot1 teleop_robot2 teleop_robot3 coop_achieved minor_penalties major_penalties]
          }
        },
      },
      paths: {},
      servers: [
        {
          url: 'https://ftc-results.firstillinoisrobotics.org'
        }
      ]
    }
  }

  # Specify the format of the output Swagger file when running 'rswag:specs:swaggerize'.
  # The openapi_specs configuration option has the filename including format in
  # the key, this may want to be changed to avoid putting yaml in json files.
  # Defaults to json. Accepts ':json' and ':yaml'.
  config.openapi_format = :yaml
end

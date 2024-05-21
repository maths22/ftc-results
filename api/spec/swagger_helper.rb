# frozen_string_literal: true

require 'rails_helper'

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
        title: 'IL FTC Results API V1',
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
            }
          },
          event: {
            type: :object,
            properties: {
              id: { type: :integer },
              aasm_state: { type: :string, enum: %i[not_started in_progress finalized canceled] },
              context_id: { type: %i[integer null] },
              context_type: { oneOf: [
                { type: :string, enum: %w[League Division] },
                { type: :null }
              ]},
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
              channel: { type: %i[string null], description: 'Twitch channel event is streaming on' },
              can_import: { type: :boolean, description: 'Always false in public API' },
              divisions: { type: :array, items: { type: :object, properties: {
                id: { type: :integer },
                event_id: { type: :integer, description: 'ID of event containing this division' },
                name: { type: :string },
                slug: { type: :string, description: 'Short human-readable ID for division' }
              } } },
            }
          }
        }
      },
      paths: {},
      servers: [
        {
          url: '{protocol}://{host}',
          variables: {
            protocol: {
              default: 'https'
            },
            host: {
              default: 'ftc-results.firstillinoisrobotics.org'
            }
          }
        }
      ]
    }
  }

  # Specify the format of the output Swagger file when running 'rswag:specs:swaggerize'.
  # The openapi_specs configuration option has the filename including format in
  # the key, this may want to be changed to avoid putting yaml in json files.
  # Defaults to json. Accepts ':json' and ':yaml'.
  config.openapi_format = :yaml
  config.openapi_strict_schema_validation = true
end

import {
  AllVetsQuery,
  useAllVetsQuery,
  useVetAndVisitsQuery,
} from "@/generated/graphql-types.ts";
import PageLayout from "@/components/PageLayout.tsx";
import Heading from "@/components/Heading.tsx";
import Link from "@/components/Link.tsx";
import Table from "@/components/Table.tsx";
import Card from "@/components/Card.tsx";
import Button from "@/components/Button.tsx";
import Section from "@/components/Section.tsx";

type Vet = AllVetsQuery["vets"][number];
type VetsOverviewProps = {
  vetId?: string;
  onAddVetClick(): void;
};
export default function VetsOverview({
  vetId,
  onAddVetClick,
}: VetsOverviewProps) {
  const { loading, data, error } = useAllVetsQuery({
    fetchPolicy: "cache-and-network",
  });

  if (loading || error || !data) {
    return (
      <PageLayout title="Veterinarians">
        <Heading>{error ? "Loading failed" : "Loading"}</Heading>
      </PageLayout>
    );
  }

  function vetRow(vet: Vet) {
    const fullname = `${vet.firstName} ${vet.lastName}`;
    const specialties = vet.specialties.map((s) => s.name).join(", ");
    if (String(vet.id) === vetId) {
      return [<b>{fullname}</b>, <b>{specialties}</b>];
    }

    return [<Link to={`/vets/${vet.id}`}>{fullname}</Link>, specialties];
  }

  return (
    <>
      <div className="mb-2 items-baseline justify-between border-b-4 border-spr-white pb-2 md:flex">
        <Heading level="3">All Veterinarians</Heading>
      </div>
      <Table labels={["Name", "Specialities"]} values={data.vets.map(vetRow)} />
      <Card fullWidth>
        <p>
          You can add a new veterinary here. Note that this is only allowed for
          users, that have <code>ROLE_MANAGER</code>
        </p>
        <Button onClick={onAddVetClick}>Add Veterinary</Button>
      </Card>
      {vetId && <VisitsForVet vetId={parseInt(vetId)} />}
    </>
  );
}

type VisitsForVetProps = {
  vetId: number;
};

function VisitsForVet({ vetId }: VisitsForVetProps) {
  const { loading, error, data } = useVetAndVisitsQuery({
    variables: {
      vetId,
    },
  });

  if (loading) {
    return <>Loading...</>;
  }

  if (error) {
    return <>Error...</>;
  }

  if (!data || !data.vet) {
    return <>Not found</>;
  }

  return (
    <Section>
      <Heading>
        Treatments of {data.vet.firstName} {data.vet.lastName}
      </Heading>
      <Table
        labels={["Date", "Pet", "Owner"]}
        values={data.vet.visits.visits.map((visit) => [
          visit.date,
          visit.pet.name,
          <Link to={`/owners/${visit.pet.owner.id}`}>
            {visit.pet.owner.firstName} {visit.pet.owner.lastName}
          </Link>,
        ])}
      />
    </Section>
  );
}